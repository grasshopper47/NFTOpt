import "./styles/_app.scss";
import { AppProps } from "next/app";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { connected, getSignedContract, hookMetamask, network, provider } from "../frontend/utils/metamask";
import addresses from "../../addresses.json";
import { NFTOpt } from "../../typechain-types";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { loadAllRequestsAsOptionsWithAsset, requests } from "../datasources/globals"
import { BigNumber } from "ethers";
import { OptionState } from "../models/option";
import { setContract, options, loadRequestAsOptionWithAsset, loadAllOptionsWithAsset } from "../datasources/globals";
import { OptionWithAsset } from "../models/extended";
import toast, { Toaster } from "react-hot-toast";
import { dismissLastToast, TOAST_DURATION } from "../frontend/utils/toasting";
import { actions, stateLabels } from "../frontend/utils/labels";
import Header from "../frontend/components/Header";

const AccountContext   = createContext("");
const ContractsContext = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });

const RequestsContext               = createContext<OptionWithAsset[]>([]);
const RequestsHashContext           = createContext(0);
const RequestChangingIDsContext     = createContext<any>({});
const RequestIDsTransactionsContext = createContext<any>({});

const OptionsContext               = createContext<OptionWithAsset[]>([]);
const OptionsHashContext           = createContext(0);
const OptionChangingIDsContext     = createContext<any>({});
const OptionIDsTransactionsContext = createContext<any>({});

export const useAccount   = () => useContext(AccountContext);
export const useContracts = () => useContext(ContractsContext);

export const useRequests           = () => useContext(RequestsContext);
export const useRequestsHash       = () => useContext(RequestsHashContext);
export const useRequestChangingIDs = () => useContext(RequestChangingIDsContext);
export const useRequestIDsTransactionsContext = () => useContext(RequestIDsTransactionsContext);

export const useOptions           = () => useContext(OptionsContext);
export const useOptionsHash       = () => useContext(OptionsHashContext);
export const useOptionChangingIDs = () => useContext(OptionChangingIDsContext);
export const useOptionIDsTransactionsContext = () => useContext(OptionIDsTransactionsContext);

export default function App({ Component, pageProps }: AppProps)
{
    const [ account      , setAccount ]      = useState("");
    const [ requestsHash , setRequestsHash ] = useState(0);
    const [ optionsHash  , setOptionsHash ]  = useState(0);

    const updateRequestsHash = () => setRequestsHash( h => ++h );
    const updateOptionsHash  = () => setOptionsHash( h => ++h );

    const blockNumber = useRef(~0);
    const contracts   = useRef({ NFTOpt: null as unknown as NFTOpt });

    const requestChangingIDs     = useRef({});
    const requestIDsTransactions = useRef({});

    const optionChangingIDs     = useRef({});
    const optionIDsTransactions = useRef({});

    async function handleEvent
    (
        optionID    : BigNumber
    ,   transaction : any
    )
    {
        let id = optionID.toNumber();
        let action = actions[transaction.event];

        // Old events are re-emitted when the contract emits a new event after intitialization
        if (blockNumber.current >= transaction.blockNumber)
        {
            // Store tx hashes where request or options state was changed

            if (action.state === OptionState.PUBLISHED)
            {
                requestIDsTransactions.current[id] = transaction.transactionHash;
                return;
            }

            if (action.state === OptionState.WITHDRAWN)
            {
                delete requestIDsTransactions.current[id];
                return;
            }

            optionIDsTransactions.current[id] = transaction.transactionHash;
            return;
        }

        blockNumber.current = transaction.blockNumber;

        dismissLastToast();
        toast.success("Successfully " + action.label, { duration: TOAST_DURATION });
        console.log(action.label);

        if (action.state === OptionState.PUBLISHED)
        {
            // Store tx hash where request state was changed
            requestIDsTransactions.current[id] = transaction.transactionHash;

            loadRequestAsOptionWithAsset(id).then(updateRequestsHash);

            return;
        }

        let length = requests.length;
        let i = -1;

        // Request state change
        if (action.state === OptionState.WITHDRAWN)
        {
            while (++i !== length)
            {
                if (requests[i].id !== id) continue;

                requests.splice(i, 1);

                break;
            }

            // Remove id from requests that have awaiting changes
            delete requestChangingIDs.current[id];

            // Remove tx hash from cache
            delete requestIDsTransactions.current[id];

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
            delete requestChangingIDs.current[requestID];
            delete optionChangingIDs.current[id];

            updateRequestsHash();
            updateOptionsHash();

            return;
        }

        // Option state change (EXERCISED or CANCELED)
        for (let o of options)
        {
            if (o.id !== id) continue;

            o.state = action.state;

            break;
        }

        delete optionChangingIDs.current[id];

        updateOptionsHash();
    }

    useEffect
    (
        () =>
        {
            hookMetamask(window, setAccount)
            .then( async () => blockNumber.current = await provider()?.getBlockNumber() );
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
            if (requests.length === 0) loadAllRequestsAsOptionsWithAsset().then(updateRequestsHash)
            if (options.length  === 0) loadAllOptionsWithAsset().then(updateOptionsHash);

            // Subscribe to events
            for (let event of stateLabels) contracts.current.NFTOpt.on(event, handleEvent);
        }
    ,   [account]
    );

    return <>
        <Toaster containerClassName={"toast-container"} />

        <AccountContext.Provider                value={account}>
        <ContractsContext.Provider              value={contracts.current}>

        <RequestsContext.Provider               value={requests}>
        <RequestsHashContext.Provider           value={requestsHash}>
        <RequestChangingIDsContext.Provider     value={requestChangingIDs.current}>
        <RequestIDsTransactionsContext.Provider value={requestIDsTransactions.current}>

        <OptionsContext.Provider                value={options}>
        <OptionsHashContext.Provider            value={optionsHash}>
        <OptionChangingIDsContext.Provider      value={optionChangingIDs.current}>
        <OptionIDsTransactionsContext.Provider  value={optionIDsTransactions.current}>

            <Header/>
            { connected() && <Component {...pageProps} /> }

        </OptionIDsTransactionsContext.Provider>
        </OptionChangingIDsContext.Provider>
        </OptionsHashContext.Provider>
        </OptionsContext.Provider>

        </RequestIDsTransactionsContext.Provider>
        </RequestChangingIDsContext.Provider>
        </RequestsHashContext.Provider>
        </RequestsContext.Provider>

        </ContractsContext.Provider>
        </AccountContext.Provider>
    </>;
}