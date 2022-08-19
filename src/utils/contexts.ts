import { createContext, useContext } from "react";
import { NFTAsset } from "../../models/NFTAsset";

export const requestChangingIDs = {};
export const optionChangingIDs  = {};

export const useAccount = () => useContext(AccountContext);
export const useChainID = () => useContext(ChainIDContext);

export const setOptionsLoadCallback   = (cb : () => void) => OptionsLoadCallback = cb;
export const clearOptionsLoadCallback = () => OptionsLoadCallback = () => {};

export const setNFTCollectionsLoadCallback   = (cb : (arr : NFTAsset[]) => void) => NFTCollectionsLoadCallback = cb;
export const clearNFTCollectionsLoadCallback = () => NFTCollectionsLoadCallback = () => {};

export const ChainIDContext = createContext(0);
export const AccountContext = createContext("");

export let OptionsLoadCallback          : () => void = () => {};
export let NFTCollectionsLoadCallback : (arr : NFTAsset[]) => void = () => {};
