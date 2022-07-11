import { Option, OptionFlavor, OptionState } from "../models/option";
import { OptionWithAsset, Option_SOLIDITY } from "../models/extended";
import { ADDRESS0, BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { getNFTAsset } from "./NFTAssets";
import { contracts } from "./NFTOpt";

export let options  : OptionWithAsset[] = [];
export const optionChangingIDs = {};
export const clearOptions = () => options = [];

export function isExpired(option : Option | OptionWithAsset)
{
    let timeNow = new Date().getTime() / 1000;
    let timeOption = option.startDate + option.interval * SECONDS_IN_A_DAY;
    let diff = timeOption - timeNow;

    // Can exercise any time before & including the end day (AMERICAN)
    if (option.flavor === OptionFlavor.AMERICAN) return diff < 0;

    // Can exercise only on the end day (both EUROPEAN and AMERICAN)
    if (diff > -1 && diff <= SECONDS_IN_A_DAY ) return false;

    return true;
}

export async function getOption(id: number)
{
    let optionSolidity = await contracts.NFTOpt.options(id) as unknown as Option_SOLIDITY;

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

export async function loadOptionWithAsset(id: number)
{
    let option = await getOption(id);

    option["asset"] = await getNFTAsset(option);

    // @ts-ignore
    delete option.nftContract; delete option.nftId;

    options.push(option as unknown as OptionWithAsset);
}

export async function loadAllOptionsWithAsset()
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    clearOptions();

    let IDPromise = await contracts.NFTOpt.optionID();
    if (!IDPromise) return;

    // TODO: handle optionsLength > 2^53
    length = IDPromise.toNumber();

    id = length;
    while (--id !== -1)
    {
        promises.push( loadOptionWithAsset(id).catch( e => console.log(e, `Option ${id} failed to fetch`) ) );
    }

    await Promise.allSettled(promises);

    options.sort( (a, b) => b.id - a.id );
}

export async function exerciseOption(ID: number) { _setOptionState(ID, OptionState.EXERCISED); return ID; }
export async function cancelOption(ID: number)   { _setOptionState(ID, OptionState.CANCELED); return ID; }

function _setOptionState(ID: number, state : OptionState)
{
    for (let o of options)
    {
        if (o.id !== ID) continue;

        o.state = state;

        break;
    }
}