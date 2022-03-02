import type {AddressMap, DecimalsMap} from "@common/types";

import type {ID, Distinct} from "@internal/distinct";
import type {SwapType}   from "@internal/swaptype";

import {
    BigNumber,
    BigNumberish,
} from "@ethersproject/bignumber";

import {parseUnits} from "@ethersproject/units";


export interface IBaseToken extends Distinct {
    readonly name:      string;
    readonly symbol:    string;
    readonly addresses: AddressMap;
    readonly swapType:  SwapType;
    address:  (chainId: number) => string | null;
    decimals: (chainId: number) => number | null;
}

export interface Token extends IBaseToken {
    isWrappedToken:   boolean;
    underlyingToken?: Token;
    isEqual:          (other: Token) => boolean;
    canSwap:          (other: Token) => boolean;
    valueToWei:       (amt: BigNumberish, chainId: number) => BigNumber;
    wrapperAddress:   (chainId: number) => string | null;
}

export interface BaseTokenArgs {
    name:              string,
    symbol:            string,
    decimals:          number | DecimalsMap,
    addresses:         AddressMap,
    swapType:          SwapType,
    isETH?:            boolean,
    wrapperAddresses?: AddressMap,
}

export interface WrappedTokenArgs extends BaseTokenArgs {
    underlyingToken: BaseToken,
}

/**
 * Token represents an ERC20 token on Ethereum-based blockchains.
 */
export class BaseToken implements Token {
    readonly id:        ID;
    readonly name:      string;
    readonly symbol:    string;
    readonly addresses: AddressMap = {};
    readonly swapType:  SwapType;
    readonly isETH:     boolean;

    private readonly wrapperAddresses: AddressMap = {};

    protected readonly _decimals: DecimalsMap = {};

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
     * @param {SwapType} args.swapType Swap type of this token
     */
    constructor(args: BaseTokenArgs) {
        this.name      = args.name;
        this.symbol    = args.symbol;
        this.addresses = args.addresses;
        this.swapType  = args.swapType;

        this.wrapperAddresses = args.wrapperAddresses ?? {};

        if (typeof args.decimals === "number") {
            for (const [k,] of Object.entries(this.addresses)) {
                this._decimals[k] = args.decimals;
            }
        } else {
            this._decimals = args.decimals;
        }

        this.isETH = args.isETH ?? false;

        this.id = Symbol(this.symbol);
    }

    get isWrappedToken(): boolean {
        return false
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

    wrapperAddress(chainId: number): string | null {
        return this.wrapperAddresses[chainId] || null
    }

    decimals(chainId: number): number | null {
        return this._decimals[chainId] || null
    }

    isEqual(other: Token): boolean {
        return this.id === other.id
    }

    valueToWei(ether: BigNumberish, chainId: number): BigNumber {
        let etherStr: string = ether instanceof BigNumber
            ? ether.toString()
            : BigNumber.from(ether).toString();

        return parseUnits(etherStr, this.decimals(chainId))
    }

    canSwap(other: Token): boolean {
        return this.swapType === other.swapType
    }
}

export class WrappedToken extends BaseToken {
    readonly underlyingToken: BaseToken;

    constructor(args: WrappedTokenArgs) {
        super(args);

        this.underlyingToken = args.underlyingToken;
    }

    get isWrappedToken(): boolean {
        return true
    }
}