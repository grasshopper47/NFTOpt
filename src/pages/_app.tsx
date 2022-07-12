import "./styles/_app.scss";
import React from 'react';
import { AppProps } from "next/app";
import { createContext, useContext, useState, useEffect } from "react";
import { NFTOpt } from "../../typechain-types";
import { requests, loadAllRequestsAsOptionsWithAsset, clearRequests, requestChangingIDs } from "../datasources/requests"
import { options, loadAllOptionsWithAsset, clearOptions, optionChangingIDs  } from "../datasources/options"
import { OptionWithAsset } from "../models/extended";
import { createProvider, hookMetamask, network, provider, signerOrProvider } from "../frontend/utils/metamask";
import Header from "../frontend/components/Header";
import { Toaster } from "react-hot-toast";
import { clearContractsAndAssets } from "../datasources/NFTAssets";
import { setOptionsUpdatedCallback, setRequestUpdatedCallback, createNFTOptInstance } from "../frontend/utils/contracts";
import { optionIDsTransactions, requestIDsTransactions } from "../frontend/utils/contracts";
import { clearNFTOpt, contracts } from "../datasources/NFTOpt";
import Head from "next/head";

type ContextType =
{
    map          : OptionWithAsset[]    // contains requests
,   hash         : number               // hash of requests
,   changing     : {}                   // IDs of requests which have state changes
,   transactions : {}                   // transactions where requests have had state changes
};

const AccountContext   = createContext("");
const ContractsContext = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });

const RequestsContext = createContext<ContextType>({} as unknown as ContextType);
const OptionsContext  = createContext<ContextType>({} as unknown as ContextType);

export const useAccount   = () => useContext(AccountContext);
export const useContracts = () => useContext(ContractsContext);

export const useRequests  = () => useContext(RequestsContext);
export const useOptions   = () => useContext(OptionsContext);

export default function App({ Component, pageProps }: AppProps)
{
    const [ account      , setAccount ]      = useState("");
    const [ chainID      , setChainID ]      = useState(-1);
    const [ requestsHash , setRequestsHash ] = useState(0);
    const [ optionsHash  , setOptionsHash ]  = useState(0);

    let updateRequestsHash = () => setRequestsHash( h => ++h );
    let updateOptionsHash  = () => setOptionsHash( h => ++h );

    setRequestUpdatedCallback(updateRequestsHash);
    setOptionsUpdatedCallback(updateOptionsHash);

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

            clearRequests();
            clearOptions();
            clearContractsAndAssets();
            clearNFTOpt();

            setRequestsHash(0);
            setOptionsHash(0);

            createProvider();

            if (!network()) return;

            createNFTOptInstance();

            // Re-fetch cache anew
            loadAllRequestsAsOptionsWithAsset().then(updateRequestsHash);
            loadAllOptionsWithAsset().then(updateOptionsHash);

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
        <Head>
            <title>NFT-OթͲ</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>

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
