import { BigNumber } from "ethers";

export enum OptionFlavor { EUROPEAN, AMERICAN }

export enum OptionState
{
    OPEN
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