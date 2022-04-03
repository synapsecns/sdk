import type {AddressMap, DecimalsMap} from "@common/types";

import {SwapType}          from "@internal/swaptype";
import type {ID, Distinct} from "@internal/types";

import {
    BigNumber,
    type BigNumberish
} from "@ethersproject/bignumber";

import {parseUnits} from "@ethersproject/units";


export interface IBaseToken extends Distinct {
    readonly name:      string;
    readonly symbol:    string;
    readonly addresses: AddressMap;
    readonly swapType:  SwapType;

    /**
     * Returns the on-chain address of a Token respective to the passed chain ID; will return null
     * if the Token is not supported on the passed chain ID.
     * @param chainId
     */
    address:  (chainId: number) => string | null;
    /**
     * Returns the on-chain decimals value of a Token respective to the passed chain ID; will return null
     * if the Token is not supported on the passed chain ID.
     * @param chainId
     */
    decimals: (chainId: number) => number | null;
}

export interface Token extends IBaseToken {
    isGasToken:       boolean,

    isWrapperToken:   boolean;
    underlyingToken?: Token;

    /**
     * Returns true if `other` has the same ID field as this Token.
     * @param other
     */
    isEqual:          (other: Token) => boolean;

    canSwap:          (other: Token) => boolean;
    wrapperAddress:   (chainId: number) => string | null;

    /**
     * Formats the passed Wei(ish) amount to units of Ether and returns that value as a BigNumber.
     * @param amt
     * @param chainId
     */
    weiToEther:       (amt: BigNumberish, chainId: number) => BigNumber;

    /**
     * Returns the passed Ether amount as a value in units of Wei as determined
     * by the Token's decimals value for the passed chain ID.
     * @param amt
     * @param chainId
     */
    etherToWei:       (amt: BigNumberish, chainId: number) => BigNumber;

    /**
     * @deprecated use {@link etherToWei}
     * @param amt
     * @param chainId
     */
    valueToWei:       (amt: BigNumberish, chainId: number) => BigNumber;
}

export function instanceOfToken(object: any): object is Token {
    return object instanceof BaseToken || object instanceof WrapperToken
}

export interface BaseTokenArgs {
    name:              string;
    symbol:            string;
    decimals:          number | DecimalsMap;
    addresses:         AddressMap;
    swapType:          SwapType;
    isETH?:            boolean;
    isGasToken?:       boolean;
    wrapperAddresses?: AddressMap;
}

export interface WrapperTokenArgs extends BaseTokenArgs {
    underlyingToken: BaseToken;
}

/**
 * Token represents an ERC20 token on Ethereum-based blockchains.
 */
export class BaseToken implements Token {
    readonly id:         ID;
    readonly name:       string;
    readonly symbol:     string;
    readonly addresses:  AddressMap = {};
    readonly swapType:   SwapType;
    readonly isETH:      boolean;
    readonly isGasToken: boolean;

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
        this.isGasToken = args.isGasToken ?? false;

        this.id = Symbol(this.symbol);
    }

    get isWrapperToken(): boolean {
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

    weiToEther(amt: BigNumberish, chainId: number): BigNumber {
        const
            decimals   = this.decimals(chainId) || 18,
            multiplier = BigNumber.from(10).pow(18 - decimals);

        return BigNumber.from(amt).mul(multiplier)
    }

    etherToWei(amt: BigNumberish, chainId: number): BigNumber {
        let etherStr: string = amt instanceof BigNumber
            ? amt.toString()
            : BigNumber.from(amt).toString();

        return parseUnits(etherStr, this.decimals(chainId) ?? 18)
    }

    valueToWei(ether: BigNumberish, chainId: number): BigNumber {
        return this.etherToWei(ether, chainId)
    }

    canSwap(other: Token): boolean {
        return this.swapType === other.swapType
    }
}

export class WrapperToken extends BaseToken {
    readonly underlyingToken: BaseToken;

    constructor(args: WrapperTokenArgs) {
        super(args);

        this.underlyingToken = args.underlyingToken;
    }

    get isWrapperToken(): boolean {
        return true
    }
}