import {Context as ContextType, createContext, createElement, useContext} from "react";
import {WithChildren} from "../utils/types";

type CreateContextOptions = {
    name?: string;
};
type ProviderWrapped = (props: WithChildren) => JSX.Element;
type WithValue<T> = [ProviderWrapped, () => T, ContextType<T>];

function createHook<T>(Context: ContextType<T | undefined>, name?: string) {
    const useContextWrapper = () => {
        const context = useContext(Context);
        return context;
    };

    useContextWrapper.displayName = `use${name ?? "Context"}`;

    return useContextWrapper;
}

function createWrappedProvider<T>(Context: ContextType<T | undefined>, useValue: () => T, name?: string) {
    const ProviderWrapped = ({children}: WithChildren) => {
        const value = useValue();
        return createElement(Context.Provider, {value}, children);
    };

    ProviderWrapped.displayName = `${name ?? ""}ProviderWrapper`;

    return ProviderWrapped;
}

export function createContextProvider<T>(options: CreateContextOptions = {}, useValue: () => T): WithValue<T> {
    const {name} = options;

    const Context = createContext<T | undefined>(undefined);
    Context.displayName = name + "Context";

    const useContextWrapper = createHook(Context, name);

    const Provider = createWrappedProvider(Context, useValue, name);
    return [Provider, useContextWrapper, Context] as WithValue<T>;
}
