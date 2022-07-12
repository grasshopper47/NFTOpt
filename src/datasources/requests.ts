import { ADDRESS0, BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { OptionRequest } from "../models/optionRequest";
import { OptionWithAsset } from "../models/extended";
import { OptionState } from "../models/option";
import { getNFTAsset } from "./NFTAssets";
import { options } from "./options";
import { contracts } from "./NFTOpt";

export let requests : OptionWithAsset[] = [];
export const requestChangingIDs = {};

export const clearRequests = () => requests = [];

export async function loadRequestAsOptionWithAsset(id: number)
{
    let request = await contracts.NFTOpt.requests(id) as unknown as OptionRequest;

    let isValid =
    request.buyer          !== ADDRESS0
    && request.nftContract !== ADDRESS0
    && request.nftId       !== BIGNUMBER0
    && request.premium     !== BIGNUMBER0
    && request.strikePrice !== BIGNUMBER0
    && request.interval    !== 0;

    if (!isValid) return;

    requests.push
    (
        {
            id          : id
        ,   interval    : request.interval / SECONDS_IN_A_DAY
        ,   premium     : request.premium
        ,   strikePrice : request.strikePrice
        ,   flavor      : request.flavor
        ,   buyer       : request.buyer.toLowerCase()
        ,   seller      : ADDRESS0
        ,   startDate   : 0
        ,   state       : -1
        ,   asset       : await getNFTAsset(request)
        } as OptionWithAsset
    );
}

export async function loadAllRequestsAsOptionsWithAsset()
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    clearRequests();

    let IDPromise = await contracts.NFTOpt.requestID();
    if (!IDPromise) return;

    // TODO: handle optionsLength > 2^53
    length = IDPromise.toNumber();

    id = length;
    while (--id !== -1)
    {
        promises.push( loadRequestAsOptionWithAsset(id).catch( e => console.log(e, `Request ${id} failed to fetch`) ) );
    }

    await Promise.allSettled(promises);

    requests.sort( (a, b) => b.id - a.id );
}

export async function withdrawRequest(ID: number)
{
    let length = requests.length;
    let i = -1;
    while (++i !== length)
    {
        if (requests[i].id !== ID) continue;

        requests.splice(i, 1);

        break;
    }

    return ID;
}

export async function createOptionFromRequest(requestID : number, optionID : number)
{
    let length = requests.length;
    let i = -1;

    while (++i !== length)
    {
        let request = requests[i];
        if (request.id !== requestID) continue;

        requests.splice(i, 1);

        // Caterpillar >> Butterfly
        request.id = optionID;
        request.state = OptionState.OPEN;
        options.unshift(request);

        break;
    }

    return requestID;
}
