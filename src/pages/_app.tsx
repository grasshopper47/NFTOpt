// @ts-ignore
import "../styles/pages/_app.scss";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";
import { connected, hookMetamask } from "../utils/metamask";
import { OptionWithAsset } from "../utils/types";
import { options } from "../utils/options";
import { createContractInstance } from "../utils/blockchain";
import { loadAllOptionsWithAsset } from "../utils/options";

export const AccountContext = createContext("");
export const OptionsHashContext = createContext(0);
export const OptionsContext = createContext<OptionWithAsset[]>([]);
export const UpdateOptionsHashContext = createContext( () => {} );

export function useAccount() { return useContext(AccountContext); }
export function useOptions() { return useContext(OptionsContext); }
export function useupdateOptionsHash() { return useContext(UpdateOptionsHashContext); }
export function useOptionsHash() { return useContext(OptionsHashContext); }

export default function App({ Component, pageProps }: AppProps)
{
    const optionsHash = useRef(0);
    const [, setOptionsHash ] = useState(0);
    function updateOptionsHash() { ++optionsHash.current; setOptionsHash(optionsHash.current); }

    const [ account, setAccount ] = useState("");

    useEffect
    (
        () => hookMetamask(setAccount)
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!connected()) return;

            createContractInstance(updateOptionsHash);
            loadAllOptionsWithAsset().then(updateOptionsHash);
        }
    ,   [account]
    );

    return <>
        <Toaster containerClassName={"toast-container"} />

        <AccountContext.Provider value={account}>
        <OptionsHashContext.Provider value={optionsHash.current}>
        <OptionsContext.Provider value={options}>
        <UpdateOptionsHashContext.Provider value={updateOptionsHash}>
            <Header/>
            { connected() ? <Component {...pageProps} /> : <></> }
        </UpdateOptionsHashContext.Provider>
        </OptionsContext.Provider>
        </OptionsHashContext.Provider>
        </AccountContext.Provider>
    </>;
}