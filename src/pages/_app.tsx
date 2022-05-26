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
import toast, {Toaster} from "react-hot-toast";

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

    useEffect(() => {
        if (!contracts.nftOpt) {
            return;
        }
        contracts.nftOpt.on("NewRequest", () => {
            toast.success("Successfully published a new request");
        });
        contracts.nftOpt.on("Exercised", () => {
            toast.success("Successfully exercised the option request");
        });
        contracts.nftOpt.on("Filled", () => {
            toast.success("Successfully filled the option request");
        });
        contracts.nftOpt.on("Canceled", () => {
            toast.success("Successfully canceled the option request");
        });
    }, [contracts.nftOpt]);

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <Toaster />
                <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                <Component {...pageProps} />
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}
