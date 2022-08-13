import { BigNumber } from "ethers";
import { NFTAsset } from "./NFTAsset";
import { OptionFlavor, OptionState } from "./enums";

export type Option =
{
    buyer       : string
    seller      : string
    nftContract : string
    nftId       : BigNumber
    interval    : number
    premium     : BigNumber
    strikePrice : BigNumber
    startDate   : BigNumber
    flavor      : OptionFlavor
    state       : OptionState
};

export type OptionWithAsset =
{
    id          : number
,   buyer       : string
,   seller      : string
,   asset       : NFTAsset
,   startDate   : BigNumber
,   interval    : number
,   premium     : BigNumber
,   strikePrice : BigNumber
,   flavor      : OptionFlavor
,   state       : OptionState
};
