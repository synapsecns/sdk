import {ChainId} from "./chainid";

import {Tokens} from "../tokens";
import {SwapPools} from "../swappools";


import type {
    ID,
    Entity,
} from "../internal/entity";

import {BridgeUtils} from "../bridge/bridgeutils";

import type {Token} from "../token";
import type {ChainIdTypeMap} from "./types";

export namespace Networks {
    interface SupportsTokenChecks {
        chainId: ChainId,
        token:   Token,
    }

    const tokenSupportChecks: SupportsTokenChecks[] = [
        {chainId: ChainId.ETH,       token: Tokens.WETH},
        {chainId: ChainId.ETH,       token: Tokens.NETH},
        {chainId: ChainId.AVALANCHE, token: Tokens.AVAX},
        {chainId: ChainId.AVALANCHE, token: Tokens.WAVAX},
        {chainId: ChainId.AVALANCHE, token: Tokens.AVWETH},
        {chainId: ChainId.MOONRIVER, token: Tokens.MOVR},
        {chainId: ChainId.MOONRIVER, token: Tokens.WMOVR},
    ]

    const checkWrappedToken = (chainId: ChainId, token: Token): boolean => {
        let check = tokenSupportChecks.find((check) =>
            check.chainId === chainId && check.token.isEqual(token)
        );
        
        return typeof check !== "undefined"
    }

    interface NetworkArgs {
        name:          string,
        chainId:       number,
        chainCurrency: string,
    }

    export class Network implements Entity {
        readonly id:              ID;
        readonly name:            string;
        readonly chainCurrency:   string;
        readonly chainId:         number;
        readonly tokens:          Token[];
        readonly tokenAddresses:  string[];

        constructor(args: NetworkArgs) {
            this.name          = args.name
            this.chainId       = args.chainId;
            this.chainCurrency = args.chainCurrency;

            this.tokens         = SwapPools.getAllSwappableTokensForNetwork(this.chainId);
            this.tokenAddresses = this.tokens.map((t) => t.address(this.chainId));

            this.id = Symbol(`${this.name}:${this.chainId}`);
        }

        /**
         * Returns true if the Bridge Zap contract for this network
         * is a L2BridgeZap contract.
         * Currently, Ethereum mainnet is the only network for which the
         * Bridge Zap contract is a NerveBridgeZap contract.
         */
        get zapIsL2BridgeZap(): boolean {
            return this.chainId !== ChainId.ETH
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
    }

    export const ETH = new Network({
        name:          "Ethereum Mainnet",
        chainId:       ChainId.ETH,
        chainCurrency: "ETH"
    });

    export const OPTIMISM = new Network({
        name:          "Optimism",
        chainId:       ChainId.OPTIMISM,
        chainCurrency: "ETH"
    });

    export const CRONOS = new Network({
        name:          "Cronos",
        chainId:       ChainId.CRONOS,
        chainCurrency: "CRO"
    });

    export const BSC = new Network({
        name:          "Binance Smart Chain",
        chainId:       ChainId.BSC,
        chainCurrency: "BNB",
    });

    export const POLYGON = new Network({
        name:          "Polygon",
        chainId:       ChainId.POLYGON,
        chainCurrency: "MATIC",
    });

    export const FANTOM = new Network({
        name:          "Fantom",
        chainId:       ChainId.FANTOM,
        chainCurrency: "FTM",
    });

    export const BOBA = new Network({
       name:         "Boba Network",
       chainId:       ChainId.BOBA,
       chainCurrency: "ETH",
    });

    export const METIS = new Network({
        name:          "Metis",
        chainId:       ChainId.METIS,
        chainCurrency: "Metis",
    })

    export const MOONBEAM = new Network({
        name:          "Moonbeam",
        chainId:        ChainId.MOONBEAM,
        chainCurrency: "GLMR",
    })

    export const MOONRIVER = new Network({
        name:          "Moonriver",
        chainId:       ChainId.MOONRIVER,
        chainCurrency: "MOVR",
    });

    export const ARBITRUM = new Network({
        name:          "Arbitrum",
        chainId:       ChainId.ARBITRUM,
        chainCurrency: "ETH",
    });

    export const AVALANCHE = new Network({
        name:          "Avalanche C-Chain",
        chainId:       ChainId.AVALANCHE,
        chainCurrency: "AVAX",
    });

    export const AURORA = new Network({
        name:          "Aurora",
        chainId:       ChainId.AURORA,
        chainCurrency: "aETH",
    });

    export const HARMONY = new Network({
        name:          "Harmony",
        chainId:       ChainId.HARMONY,
        chainCurrency: "ONE",
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
        [ChainId.AURORA]:     AURORA,
        [ChainId.HARMONY]:    HARMONY,
    }

    export const networkName = (chainId: number): string => fromChainId(chainId).name

    export const fromChainId = (chainId: number): Network => CHAINID_NETWORK_MAP[chainId] ?? null

    /**
     * Returns true if the passed network supports the passed token.
     * @param {Network | number} network Either a {@link Network} instance, or the Chain ID of a supported network.
     * @param {Token} token A {@link Token} object.
     */
    export const networkSupportsToken = (network: Network | number, token: Token): boolean =>
        (network instanceof Network
            ? network
            : fromChainId(network)
        ).supportsToken(token)

    export const supportedNetworks = (): Network[] => Object.values(CHAINID_NETWORK_MAP)
}

export const supportedNetworks = Networks.supportedNetworks;