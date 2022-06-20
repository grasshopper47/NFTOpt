import "./_app.scss";
import { useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import { AccountContext, ContractsContext, OptionsContext } from "../providers/contexts";
import { NETWORK_NAME, TOAST_DURATION } from "../utils/constants";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import Header from "../components/Header";
import toast, { Toaster } from "react-hot-toast";
import RouteGuard from "../components/RouteGuard";
import { NFTOpt } from "../../typechain-types";
import { hookUpMetamask, getSignedContract, getCurrentAccount, getCurrentProvider, connectWallet } from "../utils/metamask";
import { dismissLastToast } from "../utils/frontend";
import { OptionState, OptionWithAsset } from "../utils/types";
import { loadOptionWithAsset, loadAllOptionsWithAsset } from "../utils/options";

let index = 0;

export default function App({ Component, pageProps }: AppProps) {
    const [loaded, setLoaded] = useState(false);
    const [account, setAccount] = useState("");
    const [contracts, setContracts] = useState<{ nftOpt : NFTOpt }>({ nftOpt : null });
    const options = useRef<OptionWithAsset[]>([]);
    const blockNo = useRef<number>(0);

    const [, doReload ] = useState(index);
    function reload() { index ^= 1; doReload(index); }

    async function onContractEvent
    (
        contract   : NFTOpt
    ,   action     : string
    ,   optionID   : number
    ,   newBlockNo : number = 0
    )
    {
        // Filter out old events which are re-emitted when intitialized, then emitted new event
        if (blockNo.current >= newBlockNo) { return; }

        blockNo.current = newBlockNo;

        dismissLastToast();

        toast.success("Successfully " + action, { duration: TOAST_DURATION });

        console.log(action);

        // For new options, reload details after publishing
        if (action[0] === "p")
        {
            const option = await loadOptionWithAsset(contract, optionID);

            if (!option) { return };

            setOptions([ ...options.current, option ]);

            return;
        }

        // For existing options, update state
        let state = 0;

        if (action[0] === "w") { state = OptionState.WITHDRAWN; }
        if (action[0] === "o") { state = OptionState.OPEN; }
        if (action[0] === "c") { state = OptionState.CANCELED; }
        if (action[0] === "e") { state = OptionState.EXERCISED; }

        for (let o of options.current)
        {
            if (o.id !== optionID) { continue; }

            o.state = state;

            break;
        }

        setOptions([ ...options.current ]);
    }

    function attachEventListeners(contract: NFTOpt)
    {
        contract.on("Published", (id, tx) => onContractEvent(contract, "published", id.toNumber(), tx.blockNumber));
        contract.on("Withdrawn", (id, tx) => onContractEvent(contract, "withdrawn", id.toNumber(), tx.blockNumber));
        contract.on("Opened"   , (id, tx) => onContractEvent(contract, "opened"   , id.toNumber(), tx.blockNumber));
        contract.on("Canceled" , (id, tx) => onContractEvent(contract, "canceled" , id.toNumber(), tx.blockNumber));
        contract.on("Exercised", (id, tx) => onContractEvent(contract, "exercised", id.toNumber(), tx.blockNumber));
    };

    function setOptions(array: OptionWithAsset[])
    {
        options.current = [...array];

        reload();
    }

    useEffect
    (
        () =>
        {
            hookUpMetamask()
            .then
            (
                () =>
                {
                    const account = getCurrentAccount();
                    if (!account) { return; }

                    setAccount(account);

                    const contract =
                    getSignedContract
                    (
                        addresses[NETWORK_NAME].NFTOpt
                    ,   NFTOptSolContract.abi
                    ) as NFTOpt;

                    contract.removeAllListeners();
                    attachEventListeners(contract);
                    setContracts({ nftOpt : contract });

                    getCurrentProvider().getBlockNumber().then( bn => blockNo.current = bn );

                    loadAllOptionsWithAsset(contract).then( r => setOptions([...r]) );

                    setLoaded(true);
                }
            );
        },
        []
    );

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <OptionsContext.Provider value={options.current}>
                    <RouteGuard account={account} loaded={loaded}>
                        <Toaster containerClassName={"toast-container"} />
                        <Header account={account} onConnectAccount={connectWallet.bind(null, setAccount)} />
                        <Component {...pageProps} />
                    </RouteGuard>
                </OptionsContext.Provider>
            </ContractsContext.Provider>
        </AccountContext.Provider>
    );
}