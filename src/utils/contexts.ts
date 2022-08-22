import { createContext, useContext } from "react";
import { NFTAsset } from "../../models/NFTAsset";

export const requestChangingIDs = {};
export const optionChangingIDs  = {};

export const useAccount = () => useContext(AccountContext);
export const useChainID = () => useContext(ChainIDContext);

export const ChainIDContext = createContext(0);
export const AccountContext = createContext("");

export const setAssetsLoadCallback    = (cb : AssetsLoaded)  => AssetsLoadCallback = cb;
export const clearAssetsLoadCallback  = ()                   => AssetsLoadCallback = _emptyCB;

export const setOptionsLoadCallback   = (cb : OptionsLoaded) => OptionsLoadCallback = cb;
export const clearOptionsLoadCallback = ()                   => OptionsLoadCallback = _emptyCB;

export const setNFTCollectionsLoadCallback   = (cb : NFTCollectionsLoaded) => NFTCollectionsLoadCallback = cb;
export const clearNFTCollectionsLoadCallback = ()                          => NFTCollectionsLoadCallback = _emptyCB;

export let AssetsLoadCallback         : AssetsLoaded;
export let OptionsLoadCallback        : OptionsLoaded;
export let NFTCollectionsLoadCallback : NFTCollectionsLoaded;

type OptionsLoaded        = () => void;
type AssetsLoaded         = () => void;
type NFTCollectionsLoaded = (arr : NFTAsset[]) => void;

const _emptyCB = () => {};
