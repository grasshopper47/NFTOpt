import React, {useState, useEffect} from "react";
import {AppProps} from "next/app";
import "./_app.scss";
import {AccountContext} from "../providers/contexts";
import {networkName, getCurrentAccount, getEthereumObject, getSignedContract, setupEthereumEventListeners} from "../utils";
import optionsSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";

const optionsContractAddr = addresses[networkName].camp;

export default function App({Component, pageProps}: AppProps) {
    const [account, setAccount] = useState(null);
    const [contract, setContract] = useState(null);

    const load = async () => {
        const ethereum = getEthereumObject();
        if (!ethereum) {
            return;
        }

        setupEthereumEventListeners(ethereum);

        const optionsContract = getSignedContract(optionsContractAddr, optionsSolContract.abi);

        if (!optionsContract) {
            return null;
        }

        const currentAccount = await getCurrentAccount();
        setContract(optionsContract);
        setAccount(currentAccount);
    };

    // useEffect(() => {
    //     load();
    // }, []);

    return (
        <AccountContext.Provider value={account}>
            <Component {...pageProps} />
        </AccountContext.Provider>
    );
}
