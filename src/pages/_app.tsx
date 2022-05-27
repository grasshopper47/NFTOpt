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
import RouteGuard from "../components/RouteGuard";

const NFTOptContractAddr = addresses[networkName].NFTOpt;

export default function App({Component, pageProps}: AppProps) {
    const [account, setAccount] = useState(null);
    const [loaded, setLoaded] = useState(false);
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

        setLoaded(true);
    };

    useEffect(() => {
        load();

        return () => {
            setLoaded(false);
        };
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
                <RouteGuard account={account} loaded={loaded}>
                    <Toaster />
                    <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                    <Component {...pageProps} />
                </RouteGuard>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}
