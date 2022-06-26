// @ts-ignore
import "../styles/pages/_app.scss";
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { AppProps } from "next/app";
import Header from "../components/Header";
import { Toaster } from "react-hot-toast";
import { connected, hookMetamask, network, setWindow } from "../utils/metamask";
import { OptionWithAsset } from "../utils/types";
import { options } from "../utils/options";
import { createContractInstance } from "../utils/blockchain";
import { loadAllOptionsWithAsset } from "../utils/options";

const OptionsHashContext       = createContext(0);
const AccountContext           = createContext("");
const OptionsContext           = createContext<OptionWithAsset[]>([]);
const OptionChangingIDsContext = createContext<any>({});
const UpdateOptionsHashContext = createContext( () => {} );

export function useOptionsHash()       { return useContext(OptionsHashContext); }
export function useAccount()           { return useContext(AccountContext); }
export function useOptions()           { return useContext(OptionsContext); }
export function useOptionChangingIDs() { return useContext(OptionChangingIDsContext); }
export function useUpdateOptionsHash() { return useContext(UpdateOptionsHashContext); }

export default function App({ Component, pageProps }: AppProps)
{
    const [, setOptionsHash ] = useState(0);

    const optionIDs   = useRef([]);
    const optionsHash = useRef(0);

    function updateOptionsHash(id : number | never[] | void = undefined)
    {
        if (id != undefined) optionIDs.current[id.toString()] = undefined;

        ++optionsHash.current;
        setOptionsHash(optionsHash.current);
    }

    const [ account, setAccount ] = useState("");

    useEffect
    (
        () => hookMetamask(window, setAccount)
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network()) return;

            if (!connected()) return;

            createContractInstance(updateOptionsHash);
            loadAllOptionsWithAsset().then(updateOptionsHash);
        }
    ,   [account]
    );

    return <>
        <Toaster containerClassName={"toast-container"} />

        <AccountContext.Provider           value={account}>
        <OptionsContext.Provider           value={options}>
        <OptionsHashContext.Provider       value={optionsHash.current}>
        <UpdateOptionsHashContext.Provider value={updateOptionsHash}>
        <OptionChangingIDsContext.Provider value={optionIDs.current}>
            <Header/>
            { connected() && <Component {...pageProps} /> }
        </OptionChangingIDsContext.Provider>
        </UpdateOptionsHashContext.Provider>
        </OptionsHashContext.Provider>
        </OptionsContext.Provider>
        </AccountContext.Provider>
    </>;
}