import {useWeb3React} from "@web3-react/core";

import {Web3Provider} from "@ethersproject/providers";

export function useWeb3Signer() {
	const {library} = useWeb3React<Web3Provider>();

	return [library?.getSigner()]
}