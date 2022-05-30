import React, { useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import "./_app.scss";
import { AccountContext, ContractsContext } from "../providers/contexts";
import { networkName, TOAST_DURATION } from "../utils/constants";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import Header from "../components/Header";
import toast, { Toaster } from "react-hot-toast";
import RouteGuard from "../components/RouteGuard";
import { NFTOpt } from "../../typechain-types";
import {
    hookUpMetamask,
    getSignedContract,
    getCurrentAccount,
    connectWallet,
    getCurrentProvider,
} from "../utils/metamask";

export default function App({ Component, pageProps }: AppProps) {
    const [account, setAccount] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [contracts, setContracts] = useState(null);
    const blockNo = useRef<number>(0);

    const success = (message: string, newBlockNo: number = 0) => {
        // Filter out old events which are re-emitted when intitialized, then emitted new event
        if (blockNo.current < newBlockNo) {
            blockNo.current = newBlockNo;
            toast.success("Successfully " + message, { duration: TOAST_DURATION });
        }
    };

    const attachEventListeners = (contract: NFTOpt) => {
        contract.on("NewRequest", (from, id, tx) => {
            success("published an option request", tx.blockNumber);
            console.log(1);
        });
        contract.on("Withdrawn", (id, tx) => {
            success("withdrawn an option request", tx.blockNumber);
            console.log(2);
        });
        contract.on("Opened", (from, id, tx) => {
            success("opened an option", tx.blockNumber);
            console.log(3);
        });
        contract.on("Opened", (from, id, tx) => {
            success("closed an option", tx.blockNumber);
            console.log(4);
        });
        contract.on("Exercised", (from, id, tx) => {
            success("exercised an option", tx.blockNumber);
            console.log(5);
        });
    };

    console.log("x");

    useEffect(() => {
        hookUpMetamask()
        .then( () => {
            getCurrentProvider().getBlockNumber().then(bn => blockNo.current = bn);

            const contract = getSignedContract(addresses[networkName].NFTOpt, NFTOptSolContract.abi) as NFTOpt;

            attachEventListeners(contract);

            setContracts({ nftOpt: contract });
            setAccount(getCurrentAccount());
            setLoaded(true);
        });
    }, []);

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <RouteGuard account={account} loaded={loaded}>
                    <Toaster toastOptions={{ duration: TOAST_DURATION }} containerClassName={"toast-container"} />
                    <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                    <Component {...pageProps} />
                </RouteGuard>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}