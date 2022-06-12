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
import { loadOptionWithAssetDetails, loadOptionsWithAsset } from "../utils/options";

export default function App({ Component, pageProps }: AppProps) {
    const [loaded, setLoaded] = useState(false);
    const [account, setAccount] = useState("");
    const [contracts, setContracts] = useState<{ nftOpt : NFTOpt }>({ nftOpt : null });
    const [options, setOptions] = useState<OptionWithAsset[]>([]);
    const blockNo = useRef<number>(0);

    function onContractEvent
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
            loadOptionWithAssetDetails(contract, optionID).then( option => setOptionsAndUpdateListeners([...options, option]) );

            return;
        }

        // For existing options, update state
        for (const o of options)
        {
            if (o.id !== optionID) { continue; }

            if (action[0] === "w") { o.state = OptionState.WITHDRAWN; break; }
            if (action[0] === "o") { o.state = OptionState.OPEN; break; }
            if (action[0] === "c") { o.state = OptionState.CLOSED; break; }
            if (action[0] === "e") { o.state = OptionState.CLOSED; break; }
        }

        setOptionsAndUpdateListeners([...options]);
    }

    function attachEventListeners(contract: NFTOpt)
    {
        contract.on("NewRequest", (id, tx) => onContractEvent(contract, "published", id.toNumber(), tx.blockNumber));
        contract.on("Withdrawn" , (id, tx) => onContractEvent(contract, "withdrawn", id.toNumber(), tx.blockNumber));
        contract.on("Opened"    , (id, tx) => onContractEvent(contract, "opened"   , id.toNumber(), tx.blockNumber));
        contract.on("Canceled"  , (id, tx) => onContractEvent(contract, "canceled" , id.toNumber(), tx.blockNumber));
        contract.on("Exercised" , (id, tx) => onContractEvent(contract, "exercised", id.toNumber(), tx.blockNumber));
    };

    function setOptionsAndUpdateListeners(options)
    {
        setOptions([...options]);

        if (!contracts.nftOpt) { return; }

        contracts.nftOpt.removeAllListeners();
        attachEventListeners(contracts.nftOpt);
    }

    useEffect
    (
        () =>
        {
            const onLoad = async () =>
            {
                await hookUpMetamask();
                setAccount(getCurrentAccount());

                const contract =
                getSignedContract
                (
                    addresses[NETWORK_NAME].NFTOpt
                ,   NFTOptSolContract.abi
                ) as NFTOpt;

                setContracts({ nftOpt : contract });

                getCurrentProvider().getBlockNumber().then( bn => blockNo.current = bn );

                loadOptionsWithAsset(contract).then( r => setOptionsAndUpdateListeners([...r]) );

                setLoaded(true);
            }

            onLoad();
        },
        []
    );

    return (
        <AccountContext.Provider value={account}>
            <ContractsContext.Provider value={contracts}>
                <OptionsContext.Provider value={options}>
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