// @ts-ignore
import { NFTOpt } from "../../typechain-types";

import { Option, OptionFlavor } from "../models/option";
import { OptionWithAsset, Option_SOLIDITY } from "../models/extended";
import { NFTOptContract } from "./globals";
import { ADDRESS0, BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { account } from "../frontend/utils/metamask";


export function isExpired(option : Option | OptionWithAsset)
{
    if (option.buyer !== account() || !option.startDate) return false;

    let timeNow = new Date().getTime() / 1000;
    let timeOption = option.startDate + option.interval * SECONDS_IN_A_DAY;
    let diff = timeOption - timeNow;

    // Can exercise only on the end day (both EUROPEAN and AMERICAN)
    if (diff > -1 && diff <= SECONDS_IN_A_DAY ) return false;

    // Can exercise any time before & including the end day (AMERICAN)
    if (option.flavor === OptionFlavor.AMERICAN) return diff <= 0;

    return false;
}

export async function getOption(id: number)
{
    let optionSolidity = await NFTOptContract().options(id) as unknown as Option_SOLIDITY;

    let isValid =
    optionSolidity.request.buyer          !== ADDRESS0
    && optionSolidity.request.nftContract !== ADDRESS0
    && optionSolidity.request.nftId       !== BIGNUMBER0
    && optionSolidity.request.premium     !== BIGNUMBER0
    && optionSolidity.request.strikePrice !== BIGNUMBER0
    && optionSolidity.request.interval    !== 0;

    if (!isValid) throw "Invalid option data received!";

    let option =
    {
        id          : id
    ,   nftContract : optionSolidity.request.nftContract
    ,   nftId       : optionSolidity.request.nftId
    ,   interval    : optionSolidity.request.interval / SECONDS_IN_A_DAY
    ,   premium     : optionSolidity.request.premium
    ,   strikePrice : optionSolidity.request.strikePrice
    ,   flavor      : optionSolidity.request.flavor
    ,   buyer       : optionSolidity.request.buyer.toLowerCase()
    ,   seller      : optionSolidity.seller.toLowerCase()
    ,   startDate   : optionSolidity.startDate.toNumber()
    ,   state       : optionSolidity.state
    };

    return option as Option;
}