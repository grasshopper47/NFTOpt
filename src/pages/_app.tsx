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
import { dismissLastToast } from "../utils/frontend";

export default function App({ Component, pageProps }: AppProps) {
    const [account, setAccount] = useState(null);
    const [loaded, setLoaded] = useState(false);
    const [contracts, setContracts] = useState(null);
    const blockNo = useRef<number>(0);

    const success = (message: string, newBlockNo: number = 0) => {
        dismissLastToast();

        // Filter out old events which are re-emitted when intitialized, then emitted new event
        if (blockNo.current < newBlockNo) {
            blockNo.current = newBlockNo;
            toast.success("Successfully " + message, { duration: TOAST_DURATION });
        }
    };

    let onContractEvent = (action: string, blockNo: number) => {
        success(`${action} request`, blockNo);
        console.log(action);
    }

    const attachEventListeners = (contract: NFTOpt) => {
        contract.on("NewRequest", (id, tx) => onContractEvent("published", tx.blockNumber) );
        contract.on("Withdrawn" , (id, tx) => onContractEvent("withdrawn", tx.blockNumber) );
        contract.on("Opened"    , (id, tx) => onContractEvent("opened"   , tx.blockNumber) );
        contract.on("Canceled"  , (id, tx) => onContractEvent("canceled" , tx.blockNumber) );
        contract.on("Exercised" , (id, tx) => onContractEvent("exercised", tx.blockNumber) );
    };

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
                    <Toaster containerClassName={"toast-container"} />
                    <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                    <Component {...pageProps} />
                </RouteGuard>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}