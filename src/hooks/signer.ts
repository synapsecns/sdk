import {useWeb3React} from "@web3-react/core";

import {getChainRpcUri} from "@internal/rpcproviders";
import {NetworkConnector} from "@internal/rpcconnector";
import {ChainIdTypeMap, ChainId, supportedChainIds} from "@chainid";
import {InjectedConnector} from "@web3-react/injected-connector";
import {useEffect, useState} from "react";
import {JsonRpcProvider, JsonRpcSigner, Web3Provider} from "@ethersproject/providers";
import {BigNumber} from "@ethersproject/bignumber";

export const NETWORK_CONNECTOR: NetworkConnector = new NetworkConnector({
	defaultChainId: ChainId.ETH,
	urls: {[ChainId.ETH]: getChainRpcUri(ChainId.ETH)}
});

const CONNECTOR_MAP: ChainIdTypeMap<NetworkConnector> = {
	[ChainId.ETH]: new NetworkConnector({
		defaultChainId: ChainId.ETH,
		urls: {[ChainId.ETH]: getChainRpcUri(ChainId.ETH)}
	}),
	[ChainId.OPTIMISM]: new NetworkConnector({
		defaultChainId: ChainId.OPTIMISM,
		urls: {[ChainId.OPTIMISM]: getChainRpcUri(ChainId.OPTIMISM)}
	}),
	[ChainId.CRONOS]: new NetworkConnector({
		defaultChainId: ChainId.CRONOS,
		urls: {[ChainId.CRONOS]: getChainRpcUri(ChainId.CRONOS)}
	}),
	[ChainId.BSC]: new NetworkConnector({
		defaultChainId: ChainId.BSC,
		urls: {[ChainId.BSC]: getChainRpcUri(ChainId.BSC)}
	}),
	[ChainId.POLYGON]: new NetworkConnector({
		defaultChainId: ChainId.POLYGON,
		urls: {[ChainId.POLYGON]: getChainRpcUri(ChainId.POLYGON)}
	}),
	[ChainId.FANTOM]: new NetworkConnector({
		defaultChainId: ChainId.FANTOM,
		urls: {[ChainId.FANTOM]: getChainRpcUri(ChainId.FANTOM)}
	}),
	[ChainId.BOBA]: new NetworkConnector({
		defaultChainId: ChainId.BOBA,
		urls: {[ChainId.BOBA]: getChainRpcUri(ChainId.BOBA)}
	}),
	[ChainId.METIS]: new NetworkConnector({
		defaultChainId: ChainId.METIS,
		urls: {[ChainId.METIS]: getChainRpcUri(ChainId.METIS)}
	}),
	[ChainId.MOONBEAM]: new NetworkConnector({
		defaultChainId: ChainId.MOONBEAM,
		urls: {[ChainId.MOONBEAM]: getChainRpcUri(ChainId.MOONBEAM)}
	}),
	[ChainId.MOONRIVER]: new NetworkConnector({
		defaultChainId: ChainId.MOONRIVER,
		urls: {[ChainId.MOONRIVER]: getChainRpcUri(ChainId.MOONRIVER)}
	}),
	[ChainId.ARBITRUM]: new NetworkConnector({
		defaultChainId: ChainId.ARBITRUM,
		urls: {[ChainId.ARBITRUM]: getChainRpcUri(ChainId.ARBITRUM)}
	}),
	[ChainId.AVALANCHE]: new NetworkConnector({
		defaultChainId: ChainId.AVALANCHE,
		urls: {[ChainId.AVALANCHE]: getChainRpcUri(ChainId.AVALANCHE)}
	}),
	[ChainId.DFK]: new NetworkConnector({
		defaultChainId: ChainId.DFK,
		urls: {[ChainId.DFK]: getChainRpcUri(ChainId.DFK)}
	}),
	[ChainId.AURORA]: new NetworkConnector({
		defaultChainId: ChainId.AURORA,
		urls: {[ChainId.AURORA]: getChainRpcUri(ChainId.AURORA)}
	}),
	[ChainId.HARMONY]: new NetworkConnector({
		defaultChainId: ChainId.HARMONY,
		urls: {[ChainId.HARMONY]: getChainRpcUri(ChainId.HARMONY)}
	}),
}

const INJECTED_CONNECTOR = new InjectedConnector({
	supportedChainIds: supportedChainIds()
});

export const Web3ReactNetworkContextName: string = "DEFAULT_NETWORK";

function useWeb3Provider() {
	const context = useWeb3React();
	const providerContext = useWeb3React(Web3ReactNetworkContextName)

	return context.active ? context : providerContext
}

function useEagerConnect() {
	const {active, activate} = useWeb3React();
	const [tried, setTried] = useState<boolean>(false);

	useEffect(() => {
		INJECTED_CONNECTOR.isAuthorized()
			.then((authorized) => {
				if (authorized) {
					activate(INJECTED_CONNECTOR, undefined, true).catch((e) => {
						console.error(e);
						setTried(true);
					})
				} else {
					setTried(true);
				}
			})
	}, [activate]);

	useEffect(() => {
		if (active) {
			setTried(true);
		}
	}, [active])

	return tried
}

function useGetSigner() {
	const {library, account} = useWeb3Provider();

	const fn = async () => {
		return library.getSigner(account).connectUnchecked()
	}

	return [fn]
}

function useSignerFromEthereum(ethereum: any) {
	const [signer, setSigner] = useState(null);

	useEffect(() => {
		if (ethereum) {
			const newProvider = new Web3Provider(ethereum);
			setSigner(newProvider.getSigner());
		}
	}, [ethereum])

	return signer
}

function useSignerFromEthereumFn() {
	const fn = (ethereum: any) => {
		const newProvider = new Web3Provider(ethereum, 'any');
		return newProvider.getSigner();
	}

	return [fn]
}

export {
	useWeb3Provider,
	useGetSigner,
	useEagerConnect,
	useSignerFromEthereum,
	useSignerFromEthereumFn
}