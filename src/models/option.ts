import { BigNumber } from "ethers";
import { NFTAsset } from "./nftAsset"

export enum OptionFlavor { EUROPEAN, AMERICAN }

export enum OptionState
{
    PUBLISHED
,   WITHDRAWN
,   OPEN
,   CANCELED
,   EXERCISED
}

export type Option =
{
    id          : number
,   buyer       : string
,   seller      : string
,   nftContract : string
,   nftId       : BigNumber
,   startDate   : number
,   interval    : number
,   premium     : BigNumber
,   strikePrice : BigNumber
,   flavor      : OptionFlavor
,   state       : OptionState
};

export type OptionWithAsset = Omit<Option, "nftContract" | "nftId"> & { asset: NFTAsset };