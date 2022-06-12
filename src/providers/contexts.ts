import { createContext, useContext, useState } from "react";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { OptionWithAsset } from "../utils/types";

export const AccountContext   = createContext("");
export const ContractsContext = createContext<{ nftOpt: NFTOpt; }>({ nftOpt: null });
export const OptionsContext   = createContext<OptionWithAsset[]>([]);

export function useAccount() {
    return useContext(AccountContext);
}

export function useContracts() {
    return useContext(ContractsContext);
}

export function useOptions() {
    return useContext(OptionsContext);
}