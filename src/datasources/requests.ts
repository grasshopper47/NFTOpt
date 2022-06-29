import { NFTOptContract } from "./globals";
import { ADDRESS0, BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { OptionRequest } from "../models/optionRequest";

export async function getRequest(id: number)
{
    let request = await NFTOptContract().requests(id) as unknown as OptionRequest;

    let isValid =
    request.buyer          !== ADDRESS0
    && request.nftContract !== ADDRESS0
    && request.nftId       !== BIGNUMBER0
    && request.premium     !== BIGNUMBER0
    && request.strikePrice !== BIGNUMBER0
    && request.interval    !== 0;

    if (!isValid) return null;

    return {
        nftContract : request.nftContract
    ,   nftId       : request.nftId
    ,   interval    : request.interval / SECONDS_IN_A_DAY
    ,   premium     : request.premium
    ,   strikePrice : request.strikePrice
    ,   flavor      : request.flavor
    ,   buyer       : request.buyer.toLowerCase()
    } as OptionRequest;
}