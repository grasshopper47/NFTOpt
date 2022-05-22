import {createContext, useContext} from "react";
import {NFTOpt} from "../../typechain-types/contracts/NFTOpt";

export const AccountContext = createContext("");
export const ContractsContext = createContext<{
    nftOpt: NFTOpt | null;
}>({
    nftOpt: null
});

export function useAccount() {
    return useContext(AccountContext);
}

export function useContracts() {
    return useContext(ContractsContext);
}