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

const RequestsHashContext       = createContext(0);
const OptionsHashContext        = createContext(0);
const AccountContext            = createContext("");
const ContractsContext          = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });
const RequestsContext           = createContext<OptionWithAsset[]>([]);
const OptionsContext            = createContext<OptionWithAsset[]>([]);
const OptionChangingIDsContext  = createContext<any>({});
const RequestChangingIDsContext = createContext<any>({});

export const useRequestsHash       = () => useContext(RequestsHashContext);
export const useOptionsHash        = () => useContext(OptionsHashContext);
export const useAccount            = () => useContext(AccountContext);
export const useContracts          = () => useContext(ContractsContext);
export const useRequests           = () => useContext(RequestsContext);
export const useOptions            = () => useContext(OptionsContext);
export const useOptionChangingIDs  = () => useContext(OptionChangingIDsContext);
export const useRequestChangingIDs = () => useContext(RequestChangingIDsContext);

export default function App({ Component, pageProps }: AppProps)
{
    const [ account      , setAccount ]      = useState("");
    const [ requestsHash , setRequestsHash ] = useState(0);
    const [ optionsHash  , setOptionsHash ]  = useState(0);

    const blockNumber        = useRef(~0);
    const optionChangingIDs  = useRef([]);
    const requestChangingIDs = useRef([]);
    const contracts          = useRef({ NFTOpt: null as unknown as NFTOpt });

    const updateRequestsHash = () => setRequestsHash( h => ++h );
    const updateOptionsHash  = () => setOptionsHash( h => ++h );

    async function handleEvent
    (
        optionID    : BigNumber
    ,   transaction : any
    )
    {
        // Old events are re-emitted when the contract emits a new event after intitialization
        if (blockNumber.current >= transaction.blockNumber) return;
        blockNumber.current = transaction.blockNumber;

        let action = actions[transaction.event];

        dismissLastToast();
        toast.success("Successfully " + action.label, { duration: TOAST_DURATION });

        console.log(action.label);

        let id = optionID.toNumber();

        if (action.state === OptionState.PUBLISHED)
        {
            loadRequestAsOptionWithAsset(id).then(updateRequestsHash);

            return;
        }

        let length = requests.length;
        let i = -1;

        if (action.state === OptionState.WITHDRAWN)
        {
            while (++i !== length)
            {
                if (requests[i].id !== id) continue;

                requests.splice(i, 1);

                break;
            }

            delete requestChangingIDs.current[(id).toString()];

            updateRequestsHash();

            return;
        }

        if (action.state === OptionState.OPEN)
        {
            // extract request ID from transaction log input data
            let tx = await transaction.getTransaction();
            let requestID = BigNumber.from("0x" + tx.data.slice(10)).toNumber();

            while (++i !== length)
            {
                let request = requests[i];
                if (request.id !== requestID) continue;

                request.state = action.state;
                options.push(request);
                requests.splice(i, 1);

                break;
            }

            delete requestChangingIDs.current[requestID.toString()];
            delete optionChangingIDs.current[id.toString()];

            updateRequestsHash();
            updateOptionsHash();

            return;
        }

        for (let o of options)
        {
            if (o.id !== id) continue;

            o.state = action.state;
            break;
        }

        delete optionChangingIDs.current[id.toString()];

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

        <AccountContext.Provider            value={account}>
        <ContractsContext.Provider          value={contracts.current}>
        <RequestsContext.Provider           value={requests}>
        <RequestsHashContext.Provider       value={requestsHash}>
        <RequestChangingIDsContext.Provider value={requestChangingIDs.current}>
        <OptionsContext.Provider            value={options}>
        <OptionsHashContext.Provider        value={optionsHash}>
        <OptionChangingIDsContext.Provider  value={optionChangingIDs.current}>
            <Header/>
            { connected() && <Component {...pageProps} /> }
        </OptionChangingIDsContext.Provider>
        </OptionsHashContext.Provider>
        </OptionsContext.Provider>
        </RequestChangingIDsContext.Provider>
        </RequestsHashContext.Provider>
        </RequestsContext.Provider>
        </ContractsContext.Provider>
        </AccountContext.Provider>
    </>;
}