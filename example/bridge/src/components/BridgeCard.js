import {
    Tokens,
    Networks
} from "@synapseprotocol/sdk";

import {useEffect, useState} from "react";

import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const ALL_NETWORKS = [
    Networks.Arbitrum,
    Networks.Avalanche,
    Networks.BSC,
    Networks.Ethereum,
    Networks.Fantom,
    Networks.Polygon
]

const NETWORK_OPTS = ALL_NETWORKS.map((net, idx) => {
    return {key: `networks-${idx}`, value: net, label: net.name}
});

function NetworkSelector({selectedNetwork, setSelectedNetwork, direction}) {
    let [selected, setSelected] = useState(
        NETWORK_OPTS.find((n) => n.value.name === selectedNetwork.name)
    )

    function onSelect(opt) {
        setSelected(opt);
        setSelectedNetwork(opt.value);
    }

    return(
        <div className="networkSelector">
            <div>
                <p>Select a network to bridge {direction}</p>
            </div>
            <Dropdown
                placeholder="I'm a placeholder!"
                options={NETWORK_OPTS}
                onChange={onSelect}
                value={selected}
            />
        </div>
    )
}

function useTokensForNetwork(selectedNetwork) {
    let [tokensForNetwork, setTokensForNetwork] = useState([])

    useEffect(() => {
        if (selectedNetwork !== null) {
            let tokens = Tokens.getAllSwappableTokensForNetwork(selectedNetwork.chainId);
            setTokensForNetwork(tokens)
        }
    }, [selectedNetwork])

    return [tokensForNetwork]
}

function makeTokenOpt(token, idx) {
    return {key: `tokens-${idx}`, value: token, label: `${token.name} (${token.symbol})`, idx }
}

function makeTokenOpts(tokensForNetwork) {
    return tokensForNetwork.map((t, idx) => makeTokenOpt(t, idx))
}

function TokenSelector({ selectedToken, setSelectedToken, tokensForNetwork, direction }) {
    let [opts, setOpts] = useState(null);

    useEffect(() => {
        let newOpts = makeTokenOpts(tokensForNetwork);
        setOpts(newOpts);
        setSelectedToken(null)
    }, [tokensForNetwork])

    function setSelection(opt) {
        setSelectedToken(opt.value);
    }

    let currentSelection = undefined;

    if (opts !== null) {
        let idx = opts.findIndex((o) => o.value === selectedToken)
        currentSelection = opts[idx]
    }

    return(
        <div className="tokenSelector">
            <div>
                <p>Select a token to bridge {direction}</p>
            </div>
            <Dropdown
                placeholder="I'm a placeholder!"
                options={opts}
                onChange={setSelection}
                value={currentSelection}
            />
        </div>
    )
}

function ValueInput({ value, setValue, token }) {
    function onChange(event) {
        let newValue = event.target.value;
        if (newValue.trim() === "") {
            newValue = "0.0";
        }

        setValue(newValue);
    }

    return(
        <div id={"valueSelector"}>
            <div>
            {token && <p>Enter an amount of {token.symbol} to bridge</p>}
            </div>
            <input type={"number"} onChange={onChange} value={value} placeholder={"Enter some numbers idfk"} minLength={20} style={{ width: "25%" }}/>
        </div>
    )
}

function SelectorsForDirection({
    direction,
    network,
    setNetwork,
    value,
    setValue,
    token,
    setToken,
    tokensForNetwork
}) {
    return(
        <div
            id={`selectors-${direction}`}
            style={{ paddingBottom: "5em" }}
        >
            <NetworkSelector
                selectedNetwork={network}
                setSelectedNetwork={setNetwork}
                direction={direction}
                style={{ width: "100%" }}
            />
            <TokenSelector
                selectedToken={token}
                setSelectedToken={setToken}
                tokensForNetwork={tokensForNetwork} direction={direction}
                style={{ width: "100%" }}
            />
            <div
                style={{
                    paddingTop: "1em"
                }}
            />
            {value && <ValueInput
                value={value}
                setValue={setValue}
                token={token}
                style={{ width: "20%" }}
            />}
        </div>
    )
}

function BridgeCard() {
    let [networkFrom, setNetworkFrom] = useState(Networks.Ethereum)
    let [tokensForNetworkFrom] = useTokensForNetwork(networkFrom);
    let [tokenFrom, setTokenFrom] = useState(null)
    let [valueFrom, setValueFrom] = useState("0.0")

    let [networkTo, setNetworkTo] = useState(Networks.BSC)
    let [tokensForNetworkTo] = useTokensForNetwork(networkTo);
    let [tokenTo, setTokenTo] = useState(null)
    // let [valueTo, setValueTo] = useState("0.0")

    return(
        <div className="BridgeCard" style={{width: "35%", margin: "0 auto"}}>
            <SelectorsForDirection
                direction={"from"}
                network={networkFrom}
                setNetwork={setNetworkFrom}
                token={tokenFrom}
                setToken={setTokenFrom}
                value={valueFrom}
                setValue={setValueFrom}
                tokensForNetwork={tokensForNetworkFrom}
            />
            <SelectorsForDirection
                direction={"to"}
                network={networkTo}
                setNetwork={setNetworkTo}
                token={tokenTo}
                setToken={setTokenTo}
                // value={valueTo}
                // setValue={setValueTo}
                tokensForNetwork={tokensForNetworkTo}
            />
        </div>
    )
}

export default BridgeCard;