import { createContext, useContext } from "react";
import { NFTAsset } from "../../models/NFTAsset";

export const requestChangingIDs = {};
export const optionChangingIDs  = {};

export const useAccount = () => useContext(AccountContext);
export const useChainID = () => useContext(ChainIDContext);

export const setOptionsUICallback   = (cb : () => void) => OptionsUICallback = cb;
export const clearOptionsUICallback = () => OptionsUICallback = () => {};

export const setNFTCollectionsLoadCallback   = (cb : (arr : NFTAsset[]) => void) => NFTCollectionsLoadCallback = cb;
export const clearNFTCollectionsLoadCallback = () => NFTCollectionsLoadCallback = () => {};

export const ChainIDContext = createContext(0);
export const AccountContext = createContext("");

export let OptionsUICallback          : () => void = () => {};
export let NFTCollectionsLoadCallback : (arr : NFTAsset[]) => void = () => {};
