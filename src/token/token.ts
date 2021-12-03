import {BigNumber, BigNumberish} from "@ethersproject/bignumber";
import {parseUnits} from "@ethersproject/units";

export interface BaseToken {
    readonly name: string,
    readonly symbol: string,
    readonly addresses: {[k: number]: string},
    readonly swapType: string,
    readonly hash: string,
    address: (chainId: number) => string | null
    decimals: (chainId: number) => number | null
}

/**
 * Token represents an ERC20 token on Ethereum-based blockchains.
 */
export class Token implements BaseToken {
    readonly name:      string;
    readonly symbol:    string;
    readonly addresses: {[k: number]: string} = {};
    readonly swapType:  string;
    readonly isETH:     boolean;

    readonly hash: string;

    protected readonly _decimals:  {[k: number]: number} = {};

    /**
     * Creates a new Token object with the defined arguments.
     * @param {Object} args Information about this token, including name, symbol, decimals, and
     * contract addresses.
     * @param {string} args.name Name of the token (example, "USD Circle")
     * @param {string} args.symbol Symbol of the token (example, "USDC")
     * @param {number|Object} args.decimals Either a single value, representing the token's ERC20 decimals value on all chains, or
     * a map in the format of { chain id => decimals for chain }.
     * If the latter is passed, values for ALL known chains must be provided.
     * @param {Object} args.addresses Mapping in the format of { chain id => address of token on chain },
     * providing the address of this token on different chains.
     * @param {string} args.swapType Swap type of this token
     */
    constructor(args: {
        name:      string,
        symbol:    string,
        decimals:  number | {[k: number]: number},
        addresses: {[k: number]: string},
        swapType:  string,
        isETH?:    boolean
    }) {
        this.name      = args.name;
        this.symbol    = args.symbol;
        this.addresses = args.addresses;
        this.swapType  = args.swapType;

        if (typeof args.decimals === "number") {
            for (const [k,v] of Object.entries(this.addresses)) {
                this._decimals[k] = args.decimals;
            }
        } else {
            this._decimals = args.decimals;
        }

        this.isETH = args.isETH ?? false;

        this.hash = Buffer.from(this.symbol).toString("base64");
    }

    /**
     * Returns the address of this token on a given network, or null if
     * the token does not exist on the passed network.
     * @param {number} chainId Chain ID
     * @return {string|null} Token's contract address for the queried network, or null
     */
    address(chainId: number): string | null {
        return this.addresses[chainId] || null
    }

    decimals(chainId: number): number | null {
        return this._decimals[chainId] || null
    }

    isEqual(other: Token): boolean {
        return this.hash === other.hash
    }

    valueToWei(amt: BigNumberish, chainId: number): BigNumber {
        let amtStr: string = BigNumber.from(amt).toString();
        return parseUnits(amtStr, this.decimals(chainId))
    }
}
