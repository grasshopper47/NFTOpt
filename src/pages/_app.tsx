import "./styles/_app.scss";
import { AppProps } from "next/app";
import toast, { Toaster } from "react-hot-toast";
import { createContext, useContext, useState, useEffect } from "react";
import addresses from "../../addresses.json";
import { NFTOpt } from "../../typechain-types";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { clearData, contracts, loadAllRequestsAsOptionsWithAsset, createOptionFromRequest, requests, withdrawRequest, cancelOption, exerciseOption } from "../datasources/globals"
import { BigNumber, ethers } from "ethers";
import { OptionState } from "../models/option";
import { options, loadRequestAsOptionWithAsset, loadAllOptionsWithAsset } from "../datasources/globals";
import { OptionWithAsset } from "../models/extended";
import { createProvider, hookMetamask, network, provider, signerOrProvider } from "../frontend/utils/metamask";
import { dismissLastToast, TOAST_DURATION } from "../frontend/utils/toasting";
import { actions, stateLabels } from "../frontend/utils/labels";
import Header from "../frontend/components/Header";

type ContextType =
{
    map          : OptionWithAsset[]     // contains requests
,   hash         : number                // hash of requests
,   changing     : {}                    // IDs of requests which have state changes
,   transactions : {}                    // transactions where requests have had state changes
};

const AccountContext   = createContext("");
const ContractsContext = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });

const RequestsContext = createContext<ContextType>({} as unknown as ContextType);
const OptionsContext  = createContext<ContextType>({} as unknown as ContextType);

export const useAccount   = () => useContext(AccountContext);
export const useContracts = () => useContext(ContractsContext);

export const useRequests  = () => useContext(RequestsContext);
export const useOptions   = () => useContext(OptionsContext);

let blockNumber = ~0;

const requestChangingIDs     = {};
const requestIDsTransactions = {};

const optionChangingIDs     =  {};
const optionIDsTransactions =  {};

export default function App({ Component, pageProps }: AppProps)
{
    const [ account      , setAccount ]      = useState("");
    const [ chainID      , setChainID ]      = useState(-1);
    const [ requestsHash , setRequestsHash ] = useState(0);
    const [ optionsHash  , setOptionsHash ]  = useState(0);

    const updateRequestsHash = () => setRequestsHash( h => ++h );
    const updateOptionsHash  = () => setOptionsHash( h => ++h );

    const onEndUpdateRequest = (ID: number) =>
    {
        delete requestChangingIDs[ID];

        updateRequestsHash();
    }

    const onEndUpdateOption = (ID: number) =>
    {
        delete optionChangingIDs[ID];

        updateOptionsHash();
    }

    const eventHandlers =
    {
        [OptionState.PUBLISHED] :
        {
            hashlogs : requestIDsTransactions
        ,   method : (ID: number) => loadRequestAsOptionWithAsset(ID).then(updateRequestsHash)
        }
    ,   [OptionState.WITHDRAWN] :
        {
            hashlogs : requestIDsTransactions
        ,   method   : (ID: number) => withdrawRequest(ID).then(onEndUpdateRequest)
        }
    ,   [OptionState.OPEN] :
        {
            hashlogs : optionIDsTransactions
        ,   method : (rID : number, oID : number) => createOptionFromRequest(rID, oID).then(onEndUpdateRequest).then(updateOptionsHash)
        }
    ,   [OptionState.CANCELED] :
        {
            hashlogs : optionIDsTransactions
        ,   method   : (ID: number) => cancelOption(ID).then(onEndUpdateOption)
        }
    ,   [OptionState.EXERCISED] :
        {
            hashlogs : optionIDsTransactions
        ,   method : (ID: number) => exerciseOption(ID).then(onEndUpdateOption)
        }
    }

    const handleEvent = (ID : BigNumber, transaction : any) =>
    {
        // Some of the old events are re-emitted when the contract emits a new event after intitialization
        if (blockNumber >= transaction.blockNumber) return;

        blockNumber = transaction.blockNumber;

        let action = actions[transaction.event];

        // Show toast of success only when called by the user action (already a toast in progress)
        if (dismissLastToast()) toast.success("Successfully " + action.label, { duration: TOAST_DURATION });

        console.log(action.label);

        let id = ID.toNumber();
        let handler = eventHandlers[action.state];

        // Store hash in logs
        if (action.state === OptionState.WITHDRAWN) delete handler.hashlogs[id];
        else handler.hashlogs[id] = transaction.transactionHash;

        if (action.state !== OptionState.OPEN) { handler.method(id); return; }

        transaction.getTransaction()
        .then
        (
            tx =>
            {
                // extract request ID from transaction input data (createOption called with requestID)
                let requestID = BigNumber.from("0x" + tx.data.slice(10)).toNumber();

                handler.method(requestID, id);
            }
        );
    }

    useEffect
    (
        () => hookMetamask(setAccount, setChainID)
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (chainID === -1) return;         // first run ignored
            console.log("setChainID", chainID);

            clearData();

            setRequestsHash(0);
            setOptionsHash(0);

            let network_ = network();
            if (!network_) return;

            let provider_ = createProvider();

            provider_.getBlockNumber().then(r => blockNumber = r);

            // Create completely new instance with the default provider (readonly)
            contracts.NFTOpt =
            new ethers.Contract
            (
                addresses[network_].NFTOpt
            ,   NFTOptSolContract.abi
            ,   provider_
            ) as NFTOpt;

            // Re-fetch cache anew
            loadAllRequestsAsOptionsWithAsset().then(updateRequestsHash);
            loadAllOptionsWithAsset().then(updateOptionsHash);

            // Subscribe to events
            for (let event of stateLabels) contracts.NFTOpt.on(event, handleEvent);
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (!network()) return;
            console.log("setAccount", account);

            // Create an upgraded/downgraded instance with connected address as signer OR with the default provider (readonly)
            // NOTE: event subscription is maintained
            contracts.NFTOpt = contracts.NFTOpt?.connect(signerOrProvider());
        }
    ,   [account]
    );

    return <>
        <Toaster containerClassName={"toast-container"} />

        <AccountContext.Provider   value={account}>
        <ContractsContext.Provider value={contracts}>

        <RequestsContext.Provider
            value=
            {{
                map          : requests
            ,   hash         : requestsHash
            ,   changing     : requestChangingIDs
            ,   transactions : requestIDsTransactions
            }}
        >

        <OptionsContext.Provider
            value=
            {{
                map          : options
            ,   hash         : optionsHash
            ,   changing     : optionChangingIDs
            ,   transactions : optionIDsTransactions
            }}
        >

            <Header/>
            { provider() && <Component {...pageProps} /> }

        </OptionsContext.Provider>
        </RequestsContext.Provider>

        </ContractsContext.Provider>
        </AccountContext.Provider>
    </>;
}