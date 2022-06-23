import { BigNumber } from "ethers";

export enum OptionFlavor { EUROPEAN, AMERICAN }

export enum OptionState
{
    PUBLISHED
,   WITHDRAWN
,   OPEN
,   CANCELED
,   EXERCISED
}

export type NFTAsset =
{
    nftId       : BigNumber
,   nftContract : string
,   name        : string
,   image       : string
};

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

export type OptionRequest =
{
    nftContract : string
,   nftId       : BigNumber
,   interval    : string
,   premium     : string
,   strikePrice : string
,   flavor      : OptionFlavor
};

export type Option_SOLIDITY = Omit<Option, "id">;
export type OptionWithAsset = Omit<Option, "nftContract" | "nftId"> & { asset: NFTAsset };