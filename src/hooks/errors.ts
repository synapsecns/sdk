import {Token} from "@token";

export class TransactionError extends Error {
	constructor(txHash: string, message: string, cause?: Error) {
		super(message)
		this.name = this.constructor.name;
		this.message = `Error in transaction ${txHash}: ${message}`;

		if (cause) {
			this.cause = cause;
		}
	}
}

export class AllowanceError extends Error {
	constructor(owner: string, spender: string, token: Token, message: string, cause?: Error) {
		super(message)
		this.name = this.constructor.name;
		this.message = `Error querying spend allowance of ${spender} for ${owner} token ${token.name}`;

		if (cause) {
			this.cause = cause;
		}
	}
}