import "./styles/_app.scss";

import React from 'react';
import Head from "next/head";
import { AppProps } from "next/app";
import { createContext, useContext, useState, useEffect } from "react";

import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { clearContracts } from "../../datasources/ERC-721/contracts";
import { clearImages } from "../../datasources/ERC-721/images";
import { clearNFTOpt } from "../../datasources/NFTOpt";
import { clearRequests, clearOptions  } from "../../datasources/options"
import { clearAssets } from "../../datasources/assets";
import { optionIDsTransactions, requestIDsTransactions } from "../controllers/NFTOpt";
import { createProvider, hookMetamask, provider } from "../utils/metamask";
import { clearNFTOptCollections } from "../../datasources/ERC-721/NFTOptCollections";
import { setBlockNumber } from "../../datasources/blockNumber";

import Header from "../components/Header";
import { Toaster } from "react-hot-toast";

type ContextType =
{
    changing     : {}       // IDs of requests which have state changes
,   transactions : {}       // Transactions where requests have had state changes
};

const ChainIDContext   = createContext(0);
const AccountContext   = createContext("");
const ContractsContext = createContext<{ NFTOpt : NFTOpt }>({ NFTOpt: null as unknown as NFTOpt });
const RequestsContext  = createContext<ContextType>({} as unknown as ContextType);
const OptionsContext   = createContext<ContextType>({} as unknown as ContextType);

export const requestChangingIDs = {};
export const optionChangingIDs  = {};

export const useAccount   = () => useContext(AccountContext);
export const useChainID   = () => useContext(ChainIDContext);
export const useContracts = () => useContext(ContractsContext);
export const useRequests  = () => useContext(RequestsContext);
export const useOptions   = () => useContext(OptionsContext);

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
            clearContracts();
            clearImages();
            clearAssets();
            clearNFTOpt();
            clearNFTOptCollections();

            // Initialization
            createProvider().getBlockNumber().then(setBlockNumber);
        }
    ,   [chainID]
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
            {{
                changing     : requestChangingIDs
            ,   transactions : requestIDsTransactions
            }}
        >

        <OptionsContext.Provider
            value=
            {{
                changing     : optionChangingIDs
            ,   transactions : optionIDsTransactions
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
