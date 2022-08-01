import { OptionFlavor, OptionState } from "../models/enums";
import { Option, OptionWithAsset } from "../models/option";
import { NFTOpt } from "../typechain-types/contracts/NFTOpt";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../utils/constants";
import { getNFTAsset } from "./assets";

export let requests : OptionWithAsset[] = [];
export let options  : OptionWithAsset[] = [];

export const clearRequests = () => requests = [];
export const clearOptions  = () => options  = [];

export function isExpired(option : OptionWithAsset) : boolean
{
    let timeNow = new Date().getTime() / 1000;
    let timeOption = option.startDate.toNumber() + option.interval * SECONDS_IN_A_DAY;
    let diff = timeOption - timeNow;

    // Can exercise any time before & including the end day (AMERICAN)
    if (option.flavor === OptionFlavor.AMERICAN) return diff < 0;

    // Can exercise only on the end day (both EUROPEAN and AMERICAN)
    if (diff > -1 && diff <= SECONDS_IN_A_DAY ) return false;

    return true;
}

export async function loadOne(NFTOpt : NFTOpt, ID : number) : Promise<void>
{
    await _getOptionWithAsset(NFTOpt, ID).then(_storeOption);
}

export async function loadAll(NFTOpt : NFTOpt) : Promise<void>
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    clearRequests();
    clearOptions();

    let IDPromise = await NFTOpt.optionID();
    if (!IDPromise) return;

    // TODO: handle optionsLength > 2^53
    length = IDPromise.toNumber();

    id = length;
    while (--id !== -1) promises.push( _getOptionWithAsset(NFTOpt, id).then(_storeOption) );

    await Promise.all(promises);

    promises =
    [
        // @ts-ignore
        () => requests.sort(_sorter)
        // @ts-ignore
    ,   () => options.sort(_sorter)
    ];

    await Promise.allSettled(promises);
}

export async function withdrawRequest(ID: number) : Promise<number>
{
    let length = requests.length;
    let i = -1;
    while (++i !== length)
    {
        if (requests[i].id !== ID) continue;

        requests.splice(i, 1);

        return ID;
    }

    return -1;
}

export async function createOptionFromRequest(ID : number) : Promise<number>
{
    let length = requests.length;
    let i = -1;

    while (++i !== length)
    {
        let request = requests[i];
        if (request.id !== ID) continue;

        request.state = OptionState.OPEN;

        // Caterpillar >> Butterfly
        options.unshift(request);
        requests.splice(i, 1);

        return ID;
    }

    return -1;
}

export async function exerciseOption(ID: number) : Promise<number> { _setOptionState(ID, OptionState.EXERCISED); return ID; }
export async function cancelOption  (ID: number) : Promise<number> { _setOptionState(ID, OptionState.CANCELED); return ID; }

async function _getOptionWithAsset(NFTOpt : NFTOpt, id: number) : Promise<OptionWithAsset>
{
    let option = await NFTOpt.options(id) as unknown as Option;

    if (option.buyer === ADDRESS0) throw "Option data is invalid.";

    return {
        id          : id
    ,   buyer       : option.buyer.toLowerCase()
    ,   seller      : option.seller.toLowerCase()
    ,   state       : option.state
    ,   premium     : option.premium
    ,   strikePrice : option.strikePrice
    ,   flavor      : option.flavor
    ,   startDate   : option.startDate
    ,   interval    : option.interval / SECONDS_IN_A_DAY
    ,   asset :
        await getNFTAsset
        ({
            nftContract : option.nftContract
        ,   nftId       : option.nftId.toString()
        })
    } as OptionWithAsset;
}

const _sorter = (a : OptionWithAsset, b : OptionWithAsset) => b.id - a.id;

const _storeOption = (option : OptionWithAsset) : void =>
{
    if (option.state === OptionState.PUBLISHED)
    {
        requests.push(option);
        return;
    }

    options.push(option);
}

const _setOptionState = (ID: number, state : OptionState) : void =>
{
    for (let o of options)
    {
        if (o.id !== ID) continue;

        o.state = state;

        break;
    }
}
