import {Web3Provider} from "@ethersproject/providers";


function useSignerFromEthereum() {
	const fn = (ethereum: any) => {
		const newProvider = new Web3Provider(ethereum, 'any');
		return newProvider.getSigner();
	}

	return [fn]
}

export {useSignerFromEthereum}