import {fetchJson} from "@ethersproject/web";
import type {ExternalProvider} from "@ethersproject/providers";

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

interface RPCRequest {
    method:  string;
    params?: Array<any>;
}

interface JsonRPCRequest extends RPCRequest {
    jsonrpc: "2.0";
    id:      number;
}

interface BatchItem {
    request: JsonRPCRequest;
    resolve: (result:  any) => void;
    reject:  (reason?: any) => void,
}

export class MiniRpcProvider implements ExternalProvider {
    readonly isMetaMask:      boolean = false;
    readonly chainId:         number;

    private _url:             string;
    private _host:            string;
    private _path:            string;

    protected _batchInterval: number;

    private _nextId:          number         = 1;
    private _batchAggregator: NodeJS.Timeout = null;
    private _pendingBatch:    BatchItem[]    = null;

    constructor(chainId: number, url: string, batchWaitTimeMs: number=50) {
        this.chainId = chainId;

        const parsed = new URL(url);
        this._url  = parsed.toString();
        this._host = parsed.host;
        this._path = parsed.pathname;

        // how long to wait to batch calls
        this._batchInterval = batchWaitTimeMs;
    }

    /* c8 ignore start */
    /**
     * Amount of time, in milliseconds, between batch RPC calls
     */
    get batchInterval(): number {
        return this._batchInterval
    }

    /**
     * Sets the provider's interval for sending batch RPC calls.
     * @param interval amount of time in milliseconds the provider will wait between sending batch RPC calls
     * @internal
     */
    set batchInterval(interval: number) {
        this._batchInterval = interval;
    }

    get url(): string {
        return this._url
    }

    /**
     * @internal
     */
    set url(newUrl: string | URL) {
        const parsed = newUrl instanceof URL ? newUrl : new URL(newUrl);
        this._host = parsed.host;
        this._path = parsed.pathname;
        this._url  = parsed.toString();
    }

    get host(): string {
        return this._host
    }

    get path(): string {
        return this._path
    }
    /* c8 ignore stop */

    async request(request: RPCRequest): Promise<any> {
        if (request.method === 'eth_chainId') {
            return `0x${this.chainId.toString(16)}`
        }

        if (this._pendingBatch === null) {
            this._pendingBatch = [];
        }

        const batchItem: BatchItem = {
            request: {
                jsonrpc: "2.0",
                id:     (this._nextId++),
                ...request
            },
            resolve: null,
            reject:  null,
        };

        const prom: Promise<any> = new Promise((resolve, reject) => {
            batchItem.resolve = resolve;
            batchItem.reject  = reject;
        });

        this._pendingBatch.push(batchItem);

        if (!this._batchAggregator) {
            setTimeout(() => this._processBatch(), this._batchInterval);
        }

        return prom
    }

    private async _processBatch() {
        let currentBatch = this._pendingBatch;

        this._pendingBatch    = null;
        this._batchAggregator = null;

        if (currentBatch === null) {
            currentBatch = [];
        }

        const requests: JsonRPCRequest[] = currentBatch.map(req => req.request);

        if (requests.length === 0) {
            return
        }

        return fetchJson(this._url, JSON.stringify(requests))
            .then(result =>
                currentBatch.forEach((req, idx) => {
                    const payload = result[idx];
                    if (payload.error) {
                        const {message, code, data} = payload.error;
                        req.reject(new RequestError(message, code, data));
                    } else {
                        req.resolve(payload.result);
                    }
                })
            )
            .catch(error => currentBatch.forEach(batchItem => batchItem.reject(error)))
    }
}