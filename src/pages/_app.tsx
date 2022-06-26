import "../styles/pages/_app.scss";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import Header from "../components/Header";
import toast, { Toaster } from "react-hot-toast";
import { connected, getSignedContract, hookMetamask, network, provider, setWindow } from "../utils/metamask";
import { OptionState, OptionWithAsset } from "../models/option";
import { loadOptionWithAsset, options, setContract } from "../datasources/options";
import { loadAllOptionsWithAsset } from "../datasources/options";
import { NFTOpt } from "../../typechain-types";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import { dismissLastToast, actionLabels, TOAST_DURATION, events } from "../utils/toasting";
import { BigNumber } from "ethers";

const OptionsHashContext       = createContext(0);
const AccountContext           = createContext("");
const ContractsContext         = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });
const OptionsContext           = createContext<OptionWithAsset[]>([]);
const OptionChangingIDsContext = createContext<any>({});

export function useOptionsHash()       { return useContext(OptionsHashContext); }
export function useAccount()           { return useContext(AccountContext); }
export function useContracts()         { return useContext(ContractsContext); }
export function useOptions()           { return useContext(OptionsContext); }
export function useOptionChangingIDs() { return useContext(OptionChangingIDsContext); }

export default function App({ Component, pageProps }: AppProps)
{
    const [ account , setAccount ]     = useState("");
    const [         , setOptionsHash ] = useState(0);

    const blockNumber       = useRef(~0);
    const optionsHash       = useRef(0);
    const optionChangingIDs = useRef([]);
    const contracts         = useRef({ NFTOpt: null as unknown as NFTOpt });

    function updateOptionsHash()
    {
        ++optionsHash.current;
        setOptionsHash(optionsHash.current);
    }

    function handleEvent
    (
        optionID    : BigNumber
    ,   transaction : any
    )
    {
        // Old events are re-emitted when the contract emits a new event after intitialization
        if (blockNumber.current >= transaction.blockNumber) return;
        blockNumber.current = transaction.blockNumber;

        let state = events[transaction.event] as OptionState;

        dismissLastToast();
        toast.success("Successfully " + actionLabels[state], { duration: TOAST_DURATION });

        console.log(actionLabels[state]);

        let id = optionID.toNumber();

        if (state === OptionState.PUBLISHED)
        {
            loadOptionWithAsset(id).then(updateOptionsHash);

            return;
        }

        for (let o of options)
        {
            if (o.id !== id) continue;

            o.state = state;
            break;
        }

        delete optionChangingIDs.current[id.toString()];

        updateOptionsHash();
    }

    useEffect
    (
        () =>
        {
            hookMetamask(window, setAccount);

            // Store current block number to filter out old events
            provider().getBlockNumber().then(r => blockNumber.current = r);
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network()) return;

            if (!connected()) return;

            contracts.current.NFTOpt?.removeAllListeners();

            // Create a new instance with connected address as signer
            contracts.current.NFTOpt =
            getSignedContract
            (
                addresses[network()].NFTOpt
            ,   NFTOptSolContract.abi
            ) as NFTOpt;

            // Set contract instance in options singleton
            setContract(contracts.current.NFTOpt);

            // Re-fetch cache anew
            loadAllOptionsWithAsset().then(updateOptionsHash);

            // Subscribe to events
            for (let event of Object.keys(events)) contracts.current.NFTOpt.on(event, handleEvent);
        }
    ,   [account]
    );

    return <>
        <Toaster containerClassName={"toast-container"} />

        <AccountContext.Provider           value={account}>
        <ContractsContext.Provider         value={contracts.current}>
        <OptionsContext.Provider           value={options}>
        <OptionsHashContext.Provider       value={optionsHash.current}>
        <OptionChangingIDsContext.Provider value={optionChangingIDs.current}>
            <Header/>
            { connected() && <Component {...pageProps} /> }
        </OptionChangingIDsContext.Provider>
        </OptionsHashContext.Provider>
        </OptionsContext.Provider>
        </ContractsContext.Provider>
        </AccountContext.Provider>
    </>;
}