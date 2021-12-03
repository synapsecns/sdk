import {BigNumber, ethers, providers} from "ethers";

import {ChainId, synToken} from "@synapseprotocol/sdk";

import {useEffect, useState} from "react";

function useProvider() {
    let [provider] = useState(new providers.JsonRpcProvider("https://bsc-dataseed.binance.org", {chainId: ChainId.BSC}));

    return provider;
}

function useContractInstance() {
    let provider = useProvider();
    let [contractInstance] = useState(synToken(ChainId.BSC, provider));

    return contractInstance;
}

function useGetData({dataKey, contractInstance}) {
    let [data, setData] = useState(null);
    let [didFire, setDidFire] = useState(false);

    let contractFunc;
    // eslint-disable-next-line
    switch (dataKey) {
        case "symbol":
            contractFunc = contractInstance.symbol;
            break;
        case "decimals":
            contractFunc = contractInstance.decimals;
            break;
        case "totalSupply":
            contractFunc = contractInstance.totalSupply;
            break;
    }

    useEffect(() => {
        if (!didFire) {
            contractFunc()
                .then((res) => {
                    if (BigNumber.isBigNumber(res)) {
                        setData(ethers.utils.formatEther(res));
                    } else {
                        setData(res.toString());
                    }
                })

            setDidFire(true);
        }
        // eslint-disable-next-line
    }, [didFire, data]);

    return data
}

function BasicDetailSection({ contractInstance, dataKey, className, headerText}) {
    let data = useGetData({dataKey, contractInstance})

    return(
        <div className={className}>
            <h1>{headerText}</h1>
            <h3>{data ? data : "..."}</h3>
        </div>
    )
}

function TokenDetails() {
    let contractInstance = useContractInstance();

    return(
        <div className="TokenDetails">
            <div className={"Name"}>
                <h1>Token Name</h1>
                <h3>Synapse</h3>
            </div>
            <BasicDetailSection contractInstance={contractInstance} dataKey={"symbol"} className={"Symbol"} headerText={"Token Symbol"}/>
            <BasicDetailSection contractInstance={contractInstance} dataKey={"decimals"} className={"Decimals"} headerText={"Token Decimals"}/>
            <BasicDetailSection contractInstance={contractInstance} dataKey={"totalSupply"} className={"Total Supply"} headerText={"Total Supply"} isWei={true}/>
        </div>
    )

}

export default TokenDetails;