import "./styles/_app.scss";
import { AppProps } from "next/app";
import toast, { Toaster } from "react-hot-toast";
import { createContext, useContext, useState, useEffect } from "react";
import addresses from "../../addresses.json";
import { NFTOpt } from "../../typechain-types";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { clearData, contracts, loadAllRequestsAsOptionsWithAsset, requests } from "../datasources/globals"
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

    async function handleEvent
    (
        ID          : BigNumber
    ,   transaction : any
    )
    {
        let id_ = ID.toNumber();
        let action = actions[transaction.event];

        // Old events are re-emitted when the contract emits a new event after intitialization
        if (blockNumber >= transaction.blockNumber)
        {
            // Store tx hashes where request or options state was changed

            if (action.state === OptionState.PUBLISHED)
            {
                requestIDsTransactions[id_] = transaction.transactionHash;
                return;
            }

            if (action.state === OptionState.WITHDRAWN)
            {
                delete requestIDsTransactions[id_];
                return;
            }

            optionIDsTransactions[id_] = transaction.transactionHash;
            return;
        }

        blockNumber = transaction.blockNumber;

        // Show toast of success only when triggered by the user
        if (dismissLastToast()) toast.success("Successfully " + action.label, { duration: TOAST_DURATION });

        console.log(action.label);

        if (action.state === OptionState.PUBLISHED)
        {
            // Store tx hash where request state was changed
            requestIDsTransactions[id_] = transaction.transactionHash;

            loadRequestAsOptionWithAsset(id_).then(updateRequestsHash);

            return;
        }

        let length = requests.length;
        let i = -1;

        // Request state change
        if (action.state === OptionState.WITHDRAWN)
        {
            while (++i !== length)
            {
                if (requests[i].id !== id_) continue;

                requests.splice(i, 1);

                break;
            }

            // Remove id_ from requests that have awaiting changes
            delete requestChangingIDs[id_];

            // Remove tx hash from cache
            delete requestIDsTransactions[id_];

            updateRequestsHash();

            return;
        }

        // Request transforms into Option
        if (action.state === OptionState.OPEN)
        {
            // extract request ID from transaction log input data
            let tx = await transaction.getTransaction();
            let requestID = BigNumber.from("0x" + tx.data.slice(10)).toNumber();

            while (++i !== length)
            {
                let request = requests[i];
                if (request.id !== requestID) continue;

                // Caterpillar >> Butterfly
                request.state = action.state;
                options.push(request);
                requests.splice(i, 1);

                break;
            }

            // Remove ids from arrays of objects that have awaiting changes
            delete requestChangingIDs[requestID];
            delete optionChangingIDs[id_];

            updateRequestsHash();
            updateOptionsHash();

            return;
        }

        // Option state change (EXERCISED or CANCELED)
        for (let o of options)
        {
            if (o.id !== id_) continue;

            o.state = action.state;

            break;
        }

        delete optionChangingIDs[id_];

        updateOptionsHash();
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

            let provider_ = createProvider();

            let network_ = network();
            if (!network_) return;

            provider_.getBlockNumber().then(r => blockNumber = r);

            // Perform cleanup of event-listners, as they persist from one instance to another
            contracts.NFTOpt?.removeAllListeners();

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
            if (account === "") return;         // first run ignored
            console.log("setAccount", account);

            // Create an upgraded/downgraded instance with connected address as signer OR with the default provider (readonly)
            // NOTE: event subscription is maintained
            contracts.NFTOpt = contracts.NFTOpt.connect(signerOrProvider());
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