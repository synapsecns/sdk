import fetch from "isomorphic-fetch";
import type {ExternalProvider} from "@ethersproject/providers";

const JSONRPC_VERSION: string = "2.0";

export class RequestError extends Error {
    readonly code: number;
    readonly data: any;

    constructor(message: string, code: number, data: any) {
        super(message)
        this.code = code
        this.data = data
        this.name = this.constructor.name // dafuq
        this.message = message // dafuq message
    }
}

export interface JsonRpcRequest {
    method:  string,
    params?: Array<any>,
}

interface MiniRpcBatchRequest extends JsonRpcRequest {
    jsonrpc: string,
    id:      number,
}

interface MiniRpcBatchItem {
    request: MiniRpcBatchRequest;
    resolve: (value: unknown) => void;
    reject:  (reason?: any)   => void,
}

export class MiniRpcProvider implements ExternalProvider {
    readonly isMetaMask:      boolean;
    readonly chainId:         number;

    readonly url:             string;
    readonly parsedUrl:       URL;
    readonly host:            string;
    readonly path:            string;
    readonly batchWaitTimeMs: number;

    private _nextId:         number;
    private batchTimeoutId: NodeJS.Timeout;
    private batch:          MiniRpcBatchItem[];

    constructor(chainId: number, url: string, batchWaitTimeMs?: number) {
        this.isMetaMask = false;
        this._nextId = 1;
        this.batchTimeoutId = null;
        this.batch = [];

        this.chainId = chainId;
        this.url = url;
        const parsed = new URL(url);
        this.parsedUrl = parsed;
        this.host = parsed.host;
        this.path = parsed.pathname;

        // how long to wait to batch calls
        this.batchWaitTimeMs = batchWaitTimeMs ?? 50;
    }

    async request(request: JsonRpcRequest): Promise<any> {
        if (request.method === 'eth_chainId') {
            return `0x${this.chainId.toString(16)}`
        }

        let batchProm: Promise<any> = new Promise((resolve, reject) => {
            let req = {
                jsonrpc: JSONRPC_VERSION,
                id:      this._nextId++,
                method:  request.method,
                params:  request.params,
            };

            this.batch.push({
                request: req,
                resolve,
                reject,
            });

            return
        });

        this.batchTimeoutId = this.batchTimeoutId ?? setTimeout(() => this.clearBatch(), this.batchWaitTimeMs);

        return batchProm
    }

    async clearBatch() {
        const currentBatch = this.batch;

        this.batch = [];
        this.batchTimeoutId = null;

        const handleRpcResponse = (response: any): any => {
            if (!response.ok) {
                const err: RequestError = new RequestError(
                    response.statusText,
                    response.status,
                    null
                );

                this.rejectBatch(currentBatch, err);
                return null
            }

            return response
        }

        const rpcResponseProm: Promise<any> = this.fetchBatch(currentBatch)
            .then(handleRpcResponse)
            .catch(error => {
                let errStr = `Failed to send batch call: ${error}`;

                this.rejectBatch(
                    currentBatch,
                    errStr
                );

                // console.error(errStr);

                return null;
            })

        const loadJsonResponse = (resp: any): Promise<any> => resp === null ? null : resp.json()

        let rpcResponse: any;
        try {
            rpcResponse = await rpcResponseProm;
            if (rpcResponse === null) {
                return
            }
        } catch (e) {
            // console.error(e);
            return
        }

        const jsonResponseProm: Promise<any> = loadJsonResponse(rpcResponse)
            .then(d => d)
            .catch(error => {
                this.rejectBatch(
                    currentBatch,
                    `Failed to parse JSON response, error: ${error}`
                );

                return null
            })

        Promise.resolve(jsonResponseProm)
            .then(this.handleJsonResponse(currentBatch))
            .catch(() => {})
    }

    private fetchBatch(batch: MiniRpcBatchItem[]): Promise<any> {
        return fetch(this.url, {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "accept":       "application/json"
            },
            body: JSON.stringify(batch.map(item => item.request))
        });
    }

    private rejectBatchItem(reason: any): (item: MiniRpcBatchItem) => void {
        return ({reject}) => reject(reason instanceof Error ? reason : new Error(reason));
    }

    private rejectBatch(batch: MiniRpcBatchItem[], reason: any): void {
        batch.forEach(this.rejectBatchItem(reason));
        return
    }

    private handleJsonResponse(batch: MiniRpcBatchItem[]): (json: any) => void {
        return (json: any): void => {
            if (json === null) {
                return
            }

            if (json?.error?.code === -32700) {
                console.error(`${this.chainId} RPC gave invalid response`)
                return
            }

            const byKey = batch.reduce((memo, current) => {
                memo[current.request.id] = current
                return memo
            }, {});

            for (const result of json) {
                const { resolve, reject, request: { method } } = byKey[result.id]

                if (resolve && reject) {
                    if ("error" in result) {
                        reject(result?.error)
                    } else if ("result" in result) {
                        resolve(result.result)
                    } else {
                        let err: RequestError = new RequestError(
                            `Received unexpected JSON-RPC response to ${method} request.`,
                            -32000,
                            result
                        );

                        reject(err);
                    }
                }
            }
        }
    }
}