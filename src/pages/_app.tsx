import "./styles/_app.scss";

import React from 'react';
import Head from "next/head";
import { AppProps } from "next/app";
import { createContext, useContext, useState, useEffect } from "react";

import { clearContractsCache } from "../../datasources/ERC-721/contracts";
import { clearImages } from "../../datasources/ERC-721/images";
import { clearNFTOpt, contracts, createNFTOptInstance } from "../../datasources/NFTOpt";
import { clearAssets } from "../../datasources/assets";
import { clearNFTOptCollections, createNFTOptCollectionsInstances, loadNFTOptCollectionsItems } from "../../datasources/ERC-721/NFTOptCollections";
import { clearRequests, clearOptions, loadAll } from "../../datasources/options";
import { attachNFTCollectionsHandlersToInstances } from "../controllers/NFTOptCollections";
import { attachNFTOptHandlersToInstance, optionIDsTransactions, requestIDsTransactions } from "../controllers/NFTOpt";
import { connected, connectWallet, hookMetamask, network, provider, signer } from "../utils/metamask";

import Header from "../components/Header";
import { Toaster } from "react-hot-toast";
import { NFTAsset } from "../../models/NFTAsset";

type ContextType =
{
    transactions : {}       // Transactions where requests have had state changes
};

const ChainIDContext  = createContext(0);
const AccountContext  = createContext("");
const RequestsContext = createContext<ContextType>({} as unknown as ContextType);
const OptionsContext  = createContext<ContextType>({} as unknown as ContextType);

export const requestChangingIDs = {};
export const optionChangingIDs  = {};

export let onLoadCallbacks = [] as (() => void)[];

export const useAccount  = () => useContext(AccountContext);
export const useChainID  = () => useContext(ChainIDContext);
export const useRequests = () => useContext(RequestsContext);
export const useOptions  = () => useContext(OptionsContext);

let _OptionsUICallback     : () => void;
let _CollectionsUICallback : (arr : NFTAsset[]) => void;

export const setOptionsUICallback     = (cb : () => void) => _OptionsUICallback     = cb;
export const setCollectionsUICallback = (cb : (arr : NFTAsset[]) => void) => _CollectionsUICallback = cb;

export default function App({ Component, pageProps }: AppProps)
{
    const [ account , setAccount ] = useState(" ");
    const [ chainID , setChainID ] = useState(-1);

    useEffect
    (
        () =>
        {
            hookMetamask(setAccount, setChainID);

            connectWallet();
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (chainID === -1) return; // First run ignored

            // Cleanup
            clearRequests();
            clearOptions();
            clearContractsCache();
            clearImages();
            clearAssets();
            clearNFTOpt();
            clearNFTOptCollections();

            if (!network()) return;

            // Initialize contracts
            createNFTOptInstance(network(), connected() ? signer() : provider());
            createNFTOptCollectionsInstances(network(), provider());

            // Subscribe to events
            attachNFTOptHandlersToInstance(contracts.NFTOpt);
            attachNFTCollectionsHandlersToInstances(contracts.Collections);

            // Load data
            loadAll(contracts.NFTOpt).then(_OptionsUICallback);
            loadNFTOptCollectionsItems(network()).then(_CollectionsUICallback);
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (!network()) return;

            // Create an upgraded/downgraded instance with connected address as signer
            // OR with the default provider (readonly)
            // NOTE: event subscription is maintained
            if (contracts.NFTOpt.connect) contracts.NFTOpt = contracts.NFTOpt.connect(connected() ? signer() : provider());
        }
    ,   [account]
    );

    return <>
        <Head>
            <title>NFT-OթͲ</title>
            <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>

        <Toaster containerClassName={"toast-container"} />

        <ChainIDContext.Provider value={chainID}>
        <AccountContext.Provider value={account}>

        <RequestsContext.Provider
            value=
            {{ transactions : requestIDsTransactions
            }}
        >

        <OptionsContext.Provider
            value=
            {{ transactions : optionIDsTransactions
            }}
        >

            <Header/>
            { provider() && <Component {...pageProps} /> }

        </OptionsContext.Provider>
        </RequestsContext.Provider>

        </AccountContext.Provider>
        </ChainIDContext.Provider>
    </>;
}
