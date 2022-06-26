import { Option, OptionFlavor, OptionWithAsset } from "../models/option";
import { ADDRESS0, BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { account } from "../frontend/utils/metamask";
import { getCachedContract, keyOf, images } from "./NFT/localhost";
import { NFTOpt } from "../../typechain-types";
import { NFTAsset } from "../models/nftAsset";

type Option_SOLIDITY = Omit<Option, "id">;

let NFTOpt : NFTOpt;

export const setContract = (contract_) => NFTOpt = contract_;

export let options : OptionWithAsset[] = [];

export function isExpired(option : Option | OptionWithAsset )
{
    if (option.buyer !== account() || !option.startDate) return false;

    let timeNow = new Date().getTime() / 1000;
    let timeOption = option.startDate + option.interval;
    let diff = timeOption - timeNow;

    // Can exercise only on the end day (both EUROPEAN and AMERICAN)
    if (diff > -1 && diff <= SECONDS_IN_A_DAY ) return false;

    // Can exercise any time before & including the end day (AMERICAN)
    if (option.flavor === OptionFlavor.AMERICAN) return diff <= 0;

    return false;
}

async function _getOption(id: number)
{
    let optionSolidity = await NFTOpt.options(id) as unknown as Option_SOLIDITY;

    let isValid =
    optionSolidity.buyer !== ADDRESS0
    && optionSolidity.nftContract !== ADDRESS0
    && optionSolidity.nftId !== BIGNUMBER0
    && optionSolidity.premium !== BIGNUMBER0
    && optionSolidity.strikePrice !== BIGNUMBER0
    && optionSolidity.interval !== 0;

    if (!isValid) throw "Invalid option data received!";

    let option =
    {
        id          : id
    ,   buyer       : optionSolidity.buyer.toLowerCase()
    ,   seller      : optionSolidity.seller.toLowerCase()
    ,   nftContract : optionSolidity.nftContract
    ,   nftId       : optionSolidity.nftId
    ,   startDate   : optionSolidity.startDate
    ,   interval    : optionSolidity.interval / SECONDS_IN_A_DAY
    ,   premium     : optionSolidity.premium
    ,   strikePrice : optionSolidity.strikePrice
    ,   flavor      : optionSolidity.flavor
    ,   state       : optionSolidity.state
    };

    return option as Option;
}

async function _getAsset(option: Option)
{
    let NFTContract = getCachedContract(option.nftContract);

    let promises =
    [
        /* name  */ NFTContract.name().then(r => r + " - " + option.nftId.toString())
    ,   /* image */ NFTContract.tokenURI(option.nftId).then(r => JSON.parse(atob(r.slice(29))).image)
    ];

    let cache = images[keyOf(option)];
    if (cache) promises[1] = cache;

    await Promise.allSettled(promises);

    return {
        nftId       : option.nftId
    ,   nftContract : option.nftContract
    ,   name        : await promises[0]
    ,   image       : await promises[1]
    } as NFTAsset;
}

export async function loadOptionWithAsset(id: number)
{
    let option = await _getOption(id);

    option["asset"] = await _getAsset(option);

    // @ts-ignore
    delete option.nftContract; delete option.nftId;

    options.push(option as unknown as OptionWithAsset);
}

export async function loadAllOptionsWithAsset()
{
    let optionIDPromise = await NFTOpt.optionID();
    if (!optionIDPromise) return [];

    options = [];

    let promises : Promise<any>[] = [];

    // TODO: handle optionsLength > 2^53
    let optionsLength = optionIDPromise.toNumber();

    let id = -1;
    while (++id !== optionsLength)
    {
        promises.push( loadOptionWithAsset(id).catch( e => console.log(e, `Option ${id} failed to fetch`) ) );
    }

    await Promise.allSettled(promises);

    options.sort( (a, b) => a.id - b.id );
}