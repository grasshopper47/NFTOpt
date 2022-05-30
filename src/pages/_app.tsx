import React, {useState, useEffect} from "react";
import {AppProps} from "next/app";
import "./_app.scss";
import {AccountContext, ContractsContext} from "../providers/contexts";
import {networkName, TOAST_DURATION} from "../utils/constants";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import Header from "../components/Header";
import toast, {Toaster} from "react-hot-toast";
import RouteGuard from "../components/RouteGuard";
import {NFTOpt} from "../../typechain-types";
import {
    getEthereumObject,
    setupWalletConnectivityEventListeners,
    getSignedContract,
    getCurrentAccount,
    connectWallet,
    getCurrentProvider,
} from "../utils/metamask";
import {RandomNumberProvider} from "../providers/RandomProvider";

export default function App({Component, pageProps}: AppProps) {
    const [account, setAccount] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [contracts, setContracts] = useState(null);

    let blockNo = 0;

    const success = async (message: string) => {
        let newBlockNo = await getCurrentProvider().getBlockNumber();

        if (blockNo < newBlockNo) {
            blockNo = newBlockNo;
            toast.success("Successfully " + message, {duration: TOAST_DURATION});
        }
    };

    const attachEventListeners = (contract: NFTOpt) => {
        contract.on("NewRequest", (from, amount, tx) => {
            success("published a new request");
        });
    };

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        const ethereum = getEthereumObject();
        if (!ethereum) {
            return;
        }

        await setupWalletConnectivityEventListeners();

        blockNo = await getCurrentProvider().getBlockNumber();

        const NFTOptContract = getSignedContract(addresses[networkName].NFTOpt, NFTOptSolContract.abi);
        const contract = NFTOptContract as NFTOpt;

        // const contract = getSignedContract(addresses[networkName].NFTOpt, NFTOptSolContract.abi) as NFTOpt;

        attachEventListeners(contract);

        setContracts({nftOpt: contract});
        setAccount(getCurrentAccount());

        setLoaded(true);
    };

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <RandomNumberProvider>
                    <RouteGuard account={account} loaded={loaded}>
                        <Toaster toastOptions={{duration: TOAST_DURATION}} containerClassName={"toast-container"} />
                        <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                        <Component {...pageProps} />
                    </RouteGuard>
                </RandomNumberProvider>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}
