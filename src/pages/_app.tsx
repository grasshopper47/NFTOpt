import React, {useState, useEffect} from "react";
import {AppProps} from "next/app";
import "./_app.scss";
import {AccountContext, ContractsContext} from "../providers/contexts";
import {
    networkName,
    getCurrentAccount,
    getEthereumObject,
    getSignedContract,
    setupEthereumEventListeners,
    connectWallet,
} from "../utils/api";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import Header from "../components/Header";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

const NFTOptContractAddr = addresses[networkName].NFTOpt;

export default function App({Component, pageProps}: AppProps) {
    const [account, setAccount] = useState(null);
    const [contracts, setContracts] = useState({
        nftOpt: null,
    });

    const load = async () => {
        const ethereum = getEthereumObject();
        if (!ethereum) {
            return;
        }

        setupEthereumEventListeners(ethereum);

        const NFTOptContract = getSignedContract(NFTOptContractAddr, NFTOptSolContract.abi);

        if (!NFTOptContract) {
            return null;
        }

        const currentAccount = await getCurrentAccount();
        setContracts({nftOpt: NFTOptContract});
        setAccount(currentAccount);
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                    <Component {...pageProps} />
                </LocalizationProvider>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}
