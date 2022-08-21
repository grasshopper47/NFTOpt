import "./styles/_app.scss";

import React from 'react';
import Head from "next/head";
import { AppProps } from "next/app";
import { useState, useEffect } from "react";

import { network, provider } from "../../datasources/provider";
import { clearContractsCache } from "../../datasources/ERC-721/contracts";
import { clearImages } from "../../datasources/ERC-721/images";
import { clearNFTOpt, contracts, createNFTOptInstance } from "../../datasources/NFTOpt";
import { clearAssets } from "../../datasources/assets";
import { clearNFTOptCollections, createNFTOptCollectionsInstances, loadNFTOptCollectionsItems } from "../../datasources/ERC-721/NFTOptCollections";
import { clearRequests, clearOptions, loadOptions } from "../../datasources/options";
import { attachNFTCollectionsHandlersToInstances } from "../controllers/NFTOptCollections";
import { attachNFTOptHandlersToInstance } from "../controllers/NFTOpt";
import { connected, hookMetamask, signer } from "../utils/metamask";

import Header from "../components/Header";
import { Toaster } from "react-hot-toast";
import { AccountContext, ChainIDContext, NFTCollectionsLoadCallback, OptionsLoadCallback } from "../utils/contexts";

export default function App({ Component, pageProps }: AppProps)
{
    const [ account , setAccount ] = useState("");
    const [ chainID , setChainID ] = useState(-1);

    useEffect
    (
        () => hookMetamask(setAccount, setChainID)
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

            if (!network) return;

            // Initialize contracts
            createNFTOptInstance(connected ? signer : provider);
            createNFTOptCollectionsInstances();

            // Subscribe to events
            attachNFTOptHandlersToInstance(contracts.NFTOpt);
            attachNFTCollectionsHandlersToInstances(contracts.Collections);

            // Load data
            loadOptions(contracts.NFTOpt).then(OptionsLoadCallback);
            loadNFTOptCollectionsItems().then(NFTCollectionsLoadCallback);
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (account === "") return;

            // Create an upgraded/downgraded instance with connected address as signer
            // OR with the default provider (readonly)
            // NOTE: event subscription is maintained
            if (contracts.NFTOpt.connect) contracts.NFTOpt = contracts.NFTOpt.connect(connected ? signer : provider);
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

            <Header/>
            { provider && <Component {...pageProps} /> }

        </AccountContext.Provider>
        </ChainIDContext.Provider>
    </>;
}
