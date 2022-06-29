import { BigNumber } from "ethers";
import { OptionFlavor } from "./option";

export type OptionRequest =
{
    buyer       : string
,   nftContract : string
,   nftId       : BigNumber
,   interval    : number
,   premium     : BigNumber
,   strikePrice : BigNumber
,   flavor      : OptionFlavor
};