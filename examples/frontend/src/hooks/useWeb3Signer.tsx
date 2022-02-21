import {useMetaMask} from "metamask-react";
import {ethers} from "ethers";
import {useEffect, useState} from "react";
import {MetamaskStatus} from "@utils";

export function useWeb3Signer() {
    const {account, status, ethereum} = useMetaMask();

    const [_signer, setSigner] = useState<ethers.providers.JsonRpcSigner>(
        status === MetamaskStatus.CONNECTED
            ? (new ethers.providers.Web3Provider(ethereum)).getSigner()
            : null
    );

    useEffect(() => {
        if (status === MetamaskStatus.CONNECTED && _signer === null) {
            setSigner((new ethers.providers.Web3Provider(ethereum)).getSigner());
        }
    }, [status, _signer])

    function signer() { return _signer }

    return [signer] as const
}