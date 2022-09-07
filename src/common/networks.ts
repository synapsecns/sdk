import type { ChainIdTypeMap } from "@chainid";
import { ChainId, chainSupportsEIP1559 } from "@chainid";

import type {Token} from "@token";
import {Tokens}     from "@tokens";
import {SwapPools}  from "@swappools";

import type {ID, Distinct} from "@internal/types";

import {BridgeUtils} from "@bridge/bridgeutils";

import _ from "lodash";

export namespace Networks {
    type supportedTokenEdgeCase = {
        chainId: ChainId;
        token:   Token;
    }

    const tokenSupportChecks: supportedTokenEdgeCase[] = [
        {chainId: ChainId.ETH,       token: Tokens.WETH},
        {chainId: ChainId.ETH,       token: Tokens.NETH},
        {chainId: ChainId.ETH,       token: Tokens.ETH},
        {chainId: ChainId.KLAYTN,    token: Tokens.NETH},
        { chainId: ChainId.KLAYTN, token: Tokens.WETH },
        {chainId: ChainId.AVALANCHE, token: Tokens.AVAX},
        {chainId: ChainId.AVALANCHE, token: Tokens.WAVAX},
        {chainId: ChainId.AVALANCHE, token: Tokens.AVWETH},
        {chainId: ChainId.MOONRIVER, token: Tokens.MOVR},
        {chainId: ChainId.MOONRIVER, token: Tokens.WMOVR},
        {chainId: ChainId.KLAYTN, token: Tokens.KLAY},
        {chainId: ChainId.KLAYTN, token: Tokens.WKLAY},
        {chainId: ChainId.FANTOM, token: Tokens.FTM},
        {chainId: ChainId.FANTOM, token: Tokens.WFTM},
        {chainId: ChainId.POLYGON, token: Tokens.MATIC},
        {chainId: ChainId.POLYGON, token: Tokens.WMATIC},
        {chainId: ChainId.DFK,       token: Tokens.GAS_JEWEL},
        {chainId: ChainId.DFK,       token: Tokens.JEWEL},
    ];

    function checkWrappedToken(chainId: ChainId, token: Token): boolean {
        let check = tokenSupportChecks.find((check) =>
            check.chainId === chainId && check.token.isEqual(token)
        );
        
        return typeof check !== "undefined"
    }

    interface NetworkArgs {
        name:          string;
        chainId:       ChainId;
        chainCurrency: string;
        chainCurrencyCoingeckoId?: string;
    }

    export class Network implements Distinct {
        readonly id:              ID;
        readonly name:            string;
        readonly chainCurrency:   string;
        readonly chainId:         ChainId;
        readonly tokens:          Token[];
        readonly tokenAddresses:  string[];
        readonly supportsEIP1559: boolean;

        readonly chainCurrencyCoingeckoId?: string;

        constructor(args: NetworkArgs) {
            this.name            = args.name
            this.chainId         = args.chainId;
            this.chainCurrency   = args.chainCurrency;
            this.supportsEIP1559 = chainSupportsEIP1559(args.chainId);

            this.chainCurrencyCoingeckoId = args.chainCurrencyCoingeckoId;

            this.tokens         = SwapPools.getAllSwappableTokensForNetwork(this.chainId);
            this.tokenAddresses = this.tokens.map((t) => t.address(this.chainId));

            this.id = Symbol(`${this.name}:${this.chainId}`);
        }

        /**
         * Returns true if the Bridge Zap contract for this network
         * is a L2BridgeZap contract.
         * Currently, Ethereum and DFK are the only networks for which the
         * Bridge Zap contract is a L1BridgeZap contract.
         */
        get zapIsL2BridgeZap(): boolean {
            return !([ChainId.ETH as ChainId, ChainId.DFK as ChainId].includes(this.chainId))
        }

        /**
         * Returns true if the passed token is available on this network.
         * @param {Token} token A {@link Token} object.
         */
        supportsToken(token: Token): boolean {
            let checkSymbol = token.symbol;

            const
                isEthish  = checkSymbol === "ETH" && (this.chainId === ChainId.ETH || BridgeUtils.isL2ETHChain(this.chainId)),
                isWrapped = checkWrappedToken(this.chainId, token);

            if (isEthish || isWrapped) {
                return true
            }

            let tokenAddr: string = token.address(this.chainId);

            return tokenAddr !== null
                ? this.tokenAddresses.includes(tokenAddr)
                : false
        }

        get bridgeableTokens(): Token[] {
            let tokens: Token[] = [];

            const chainGasToken = Tokens.gasTokenForChain(this.chainId);

            this.tokens.forEach(t => {
                if (!_.isNull(chainGasToken)) {
                    const gasWrapper = Tokens.gasTokenWrapper(chainGasToken);
                    if (gasWrapper.isEqual(t)) {
                        return
                    }
                }

                tokens.push(t);
            });

            return tokens
        }
    }

    export const ETH = new Network({
        name:          "Ethereum Mainnet",
        chainId:       ChainId.ETH,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });

    export const OPTIMISM = new Network({
        name:          "Optimism",
        chainId:       ChainId.OPTIMISM,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });

    export const CRONOS = new Network({
        name:          "Cronos",
        chainId:       ChainId.CRONOS,
        chainCurrency: "CRO",
        chainCurrencyCoingeckoId: "crypto-com-chain",
    });

    export const BSC = new Network({
        name:          "Binance Smart Chain",
        chainId:       ChainId.BSC,
        chainCurrency: "BNB",
        chainCurrencyCoingeckoId: "binancecoin",
    });

    export const POLYGON = new Network({
        name:          "Polygon",
        chainId:       ChainId.POLYGON,
        chainCurrency: "MATIC",
        chainCurrencyCoingeckoId: "matic-network",
    });

    export const FANTOM = new Network({
        name:          "Fantom",
        chainId:       ChainId.FANTOM,
        chainCurrency: "FTM",
        chainCurrencyCoingeckoId: "fantom",
    });

    export const BOBA = new Network({
        name:          "Boba Network",
        chainId:       ChainId.BOBA,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });

    export const METIS = new Network({
        name:          "Metis",
        chainId:       ChainId.METIS,
        chainCurrency: "METIS",
        chainCurrencyCoingeckoId: "metis-token",
    });

    export const MOONBEAM = new Network({
        name:          "Moonbeam",
        chainId:       ChainId.MOONBEAM,
        chainCurrency: "GLMR",
        chainCurrencyCoingeckoId: "moonbeam",
    });

    export const MOONRIVER = new Network({
        name:          "Moonriver",
        chainId:       ChainId.MOONRIVER,
        chainCurrency: "MOVR",
    });

    export const ARBITRUM = new Network({
        name:          "Arbitrum",
        chainId:       ChainId.ARBITRUM,
        chainCurrency: "ETH",
        chainCurrencyCoingeckoId: "ethereum",
    });

    export const AVALANCHE = new Network({
        name:          "Avalanche C-Chain",
        chainId:       ChainId.AVALANCHE,
        chainCurrency: "AVAX",
        chainCurrencyCoingeckoId: "avalanche-2",
    });

    export const DFK = new Network({
        name:          "DeFi Kingdoms",
        chainId:       ChainId.DFK,
        chainCurrency: "JEWEL",
        chainCurrencyCoingeckoId: "defi-kingdoms",
    });

    export const AURORA = new Network({
        name:          "Aurora",
        chainId:       ChainId.AURORA,
        chainCurrency: "ETH",
    });

    export const HARMONY = new Network({
        name:          "Harmony",
        chainId:       ChainId.HARMONY,
        chainCurrency: "ONE",
        chainCurrencyCoingeckoId: "harmony",
    });

    export const KLAYTN = new Network({
        name:          "Klaytn",
        chainId:       ChainId.KLAYTN,
        chainCurrency: "KLAY",
    });

    const CHAINID_NETWORK_MAP: ChainIdTypeMap<Network> = {
        [ChainId.ETH]:        ETH,
        [ChainId.OPTIMISM]:   OPTIMISM,
        [ChainId.CRONOS]:     CRONOS,
        [ChainId.BSC]:        BSC,
        [ChainId.POLYGON]:    POLYGON,
        [ChainId.FANTOM]:     FANTOM,
        [ChainId.BOBA]:       BOBA,
        [ChainId.METIS]:      METIS,
        [ChainId.MOONBEAM]:   MOONBEAM,
        [ChainId.MOONRIVER]:  MOONRIVER,
        [ChainId.ARBITRUM]:   ARBITRUM,
        [ChainId.AVALANCHE]:  AVALANCHE,
        [ChainId.DFK]:        DFK,
        [ChainId.AURORA]:     AURORA,
        [ChainId.HARMONY]:    HARMONY,
        [ChainId.KLAYTN]:     KLAYTN,
    }

    export function networkName(chainId: number): string {
        return fromChainId(chainId).name
    }

    export function fromChainId(chainId: number): Network {
        return CHAINID_NETWORK_MAP[chainId] ?? null
    }

    /**
     * Returns true if the passed network supports the passed token.
     * @param {Network | number} network Either a {@link Network} instance, or the Chain ID of a supported network.
     * @param {Token} token A {@link Token} object.
     */
    export function networkSupportsToken(network: Network | ChainId, token: Token): boolean {
        return (network instanceof Network
                ? network
                : fromChainId(network)
        ).supportsToken(token)
    }

    export function supportedNetworks(): Network[] {
        return Object.values(CHAINID_NETWORK_MAP)
    }
}

export const supportedNetworks = Networks.supportedNetworks;