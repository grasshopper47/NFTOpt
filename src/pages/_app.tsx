import "./styles/_app.scss";

import React from 'react';
import Head from "next/head";
import { AppProps } from "next/app";
import { createContext, useContext, useState, useEffect } from "react";

import { NFTOpt } from "../../typechain-types";
import { loadAssetsFor } from "../../datasources/NFT/localhost";
import { clearNFTOpt, contracts } from "../../datasources/NFTOpt";
import { clearContractsAndAssets } from "../../datasources/NFTAssets";
import { requests, loadAllRequestsAsOptionsWithAsset, clearRequests, requestChangingIDs } from "../../datasources/requests"
import { options, loadAllOptionsWithAsset, clearOptions, optionChangingIDs  } from "../../datasources/options"
import { NFTAsset } from "../../models/nftAsset";
import { OptionWithAsset } from "../../models/extended";
import { setOptionsUpdatedCallback, setRequestUpdatedCallback, createNFTOptInstance, optionIDsTransactions, requestIDsTransactions } from "../utils/contracts";
import { createProvider, hookMetamask, network, provider, signerOrProvider } from "../utils/metamask";
import Header from "../components/Header";

import { Toaster } from "react-hot-toast";

type ContextType =
{
    map          : OptionWithAsset[]    // contains requests
,   hash         : number               // hash of requests
,   changing     : {}                   // IDs of requests which have state changes
,   transactions : {}                   // transactions where requests have had state changes
};

const AccountContext   = createContext("");
const AssetsContext    = createContext<NFTAsset[]>([])
const ContractsContext = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });

const RequestsContext = createContext<ContextType>({} as unknown as ContextType);
const OptionsContext  = createContext<ContextType>({} as unknown as ContextType);

export const useAccount   = () => useContext(AccountContext);
export const useAssets    = () => useContext(AssetsContext);
export const useContracts = () => useContext(ContractsContext);

export const useRequests  = () => useContext(RequestsContext);
export const useOptions   = () => useContext(OptionsContext);

export default function App({ Component, pageProps }: AppProps)
{
    const [ account      , setAccount ]      = useState("");
    const [ chainID      , setChainID ]      = useState(-1);
    const [ assets       , setAssets ]       = useState<NFTAsset[]>([]);
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

            loadAssetsFor(account).then(setAssets);
        }
    ,   [account]
    );

    return <>
        <Head>
            <title>NFT-O????</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>

        <Toaster containerClassName={"toast-container"} />

        <ContractsContext.Provider value={contracts}>
        <AccountContext.Provider   value={account}>
        <AssetsContext.Provider    value={assets}>

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

        </AssetsContext.Provider>
        </AccountContext.Provider>
        </ContractsContext.Provider>
    </>;
}
