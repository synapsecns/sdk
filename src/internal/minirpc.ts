import fetch, {Response} from "node-fetch";


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

interface MiniRpcRequest {
    jsonrpc: string,
    id:      number,
    method:  string,
    params:  any,
}

interface MiniRpcBatchItem {
    request: MiniRpcRequest;
    resolve: (value: unknown) => void;
    reject:  (reason?: any)   => void,
}

export class MiniRpcProvider {
    readonly isMetaMask:      boolean;
    readonly chainId:         number;

    readonly url:             string;
    readonly host:            string;
    readonly path:            string;

    readonly batchWaitTimeMs: number;

    protected nextId:         number;
    protected batchTimeoutId: string | NodeJS.Timeout;
    protected batch:          MiniRpcBatchItem[];

    constructor(chainId: number, url: string, batchWaitTimeMs?: number) {
        this.isMetaMask = false
        this.nextId = 1
        this.batchTimeoutId = null
        this.batch = []

        this.chainId = chainId
        this.url = url
        const parsed = new URL(url)
        this.host = parsed.host
        this.path = parsed.pathname
        // how long to wait to batch calls
        this.batchWaitTimeMs = batchWaitTimeMs ?? 50
    }

    async request(method: string|MiniRpcRequest, params: any) {
        const _method: string = typeof method === "string" ? method : method.method;

        if (_method === 'eth_chainId') {
            return `0x${this.chainId.toString(16)}`
        }

        const promise = new Promise((resolve, reject) => {
            this.batch.push({
                request: {
                    jsonrpc: '2.0',
                    id: this.nextId++,
                    method: _method,
                    params
                },
                resolve,
                reject
            })
        });

        this.batchTimeoutId = this.batchTimeoutId ?? setTimeout(this.clearBatch, this.batchWaitTimeMs);

        return promise
    }

    sendAsync(request: MiniRpcRequest, callback: any) {
        this.request(request.method, request.params)
            .then(result => callback(null, { jsonrpc: '2.0', id: request.id, result }))
            .catch(error => callback(error, null))
    }

    async clearBatch() {
        const batch = this.batch;
        this.batch = [];
        this.batchTimeoutId = null;

        const rejectBatchItem = (reason: any): (item: MiniRpcBatchItem) => void =>
            ({reject}) => reject(reason instanceof Error ? reason : new Error(reason));

        let response: Response;
        try {
            response = await fetch(this.url, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json'
                },
                body: JSON.stringify(batch.map(item => item.request))
            });
        } catch (error) {
            batch.forEach(rejectBatchItem("Failed to send batch call"));
            return
        }

        if (!response.ok) {
            batch.forEach(rejectBatchItem(`${response.status}: ${response.statusText}`))
            return
        }

        let json: any;
        try {
            json = await response.json();
        } catch (error) {
            batch.forEach(rejectBatchItem("Failed to parse JSON response"));
            return
        }

        const byKey = batch.reduce((memo, current) => {
            memo[current.request.id] = current
            return memo
        }, {});

        try {
            if (json?.error?.code === -32700) {
                console.error(`${this.chainId} RPC gave invalid response`)
                return
            }

            for (const result of json) {
                const { resolve, reject, request: { method } } = byKey[result.id]

                if (resolve && reject) {
                    if ("error" in result) {
                        reject(result?.error)
                    } else if ("result" in result) {
                        resolve(result.result)
                    } else {
                        reject(new RequestError(`Received unexpected JSON-RPC response to ${method} request.`, -32000, result))
                    }
                }
            }
        } catch (e) {}

    }
}