import { BigNumber } from "ethers";
import { OptionFlavor } from "./option";

export type OptionRequest =
{
    nftContract : string
,   nftId       : BigNumber
,   interval    : string
,   premium     : string
,   strikePrice : string
,   flavor      : OptionFlavor
};