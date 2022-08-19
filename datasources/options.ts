import { OptionFlavor, OptionState } from "../models/enums";
import { Option, OptionWithAsset } from "../models/option";
import { NFTOpt } from "../typechain-types/contracts/NFTOpt";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../utils/constants";
import { getNFTAsset } from "./assets";

export const requestsChanged = { value : false };
export const optionsChanged  = { value : false };

export let requests : OptionWithAsset[] = [];
export let options  : OptionWithAsset[] = [];

export const clearRequests = () => requests = [];
export const clearOptions  = () => options  = [];

export const loadAll = async (NFTOpt : NFTOpt) : Promise<void> =>
{
    // Fetch from Graph
    const reply = await fetch
    (
        "http://127.0.0.1:8000/subgraphs/name/NFTOpt"
    ,   {
            method : "POST"
        ,   body   : JSON.stringify({ query: `{ requests { id } options { id } }` })
        }
    )
    .catch( () => { return { json: () => "{}" } } );

    let json = await reply.json();

    if (json.errors)
    {
        for (const e of json.errors) console.error(e.message);

        // Force loading from localhost on error (due to missing host on fetch or in the Graph query itself)
        json = "{}";
    }

    clearRequests();
    clearOptions();

    // Prepare asset data loading promises
    if (json !== "{}" && json.data.account) _loadFromGraph(NFTOpt, json.data.account)
    else                                    await _loadFromLogs(NFTOpt);

    await Promise.all(promises);
}

export const loadOptionWithAsset = async (NFTOpt : NFTOpt, ID : number) : Promise<void> =>
{
    let option = await NFTOpt.options(ID) as any as Option;

    if (option.buyer === ADDRESS0) return; // withdrawn/deleted option

    let optionWithAsset =
    {
        id          : ID
    ,   buyer       : option.buyer
    ,   seller      : option.seller
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

    if (option.state === OptionState.PUBLISHED)
    {
        requests.push(optionWithAsset);
        requestsChanged.value = true;

        return;
    }

    options.push(optionWithAsset);
    optionsChanged.value = true;
}

export const withdrawRequest = async (ID: number) : Promise<number> =>
{
    let length = requests.length;
    let i = -1;
    while (++i !== length)
    {
        if (requests[i].id !== ID) continue;

        requests.splice(i, 1);

        requestsChanged.value = true;

        return ID;
    }

    return -1;
}

export const createOptionFromRequest = async (ID: number) : Promise<number> =>
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

        requestsChanged.value = optionsChanged.value = true;

        return ID;
    }

    return -1;
}

export const exerciseOption = async (ID: number) : Promise<number> => { _setOptionState(ID, OptionState.EXERCISED); return ID; }
export const cancelOption   = async (ID: number) : Promise<number> => { _setOptionState(ID, OptionState.CANCELED); return ID; }

export const isExpired = (option : OptionWithAsset) : boolean =>
{
    const timeNow = new Date().getTime() * 0.001;
    const timeOption = option.startDate.toNumber() + option.interval * SECONDS_IN_A_DAY;
    const diff = timeOption - timeNow;

    // Can exercise any time before & including the end day (AMERICAN)
    if (option.flavor === OptionFlavor.AMERICAN) return diff < 0;

    // Can exercise only on the end day (both EUROPEAN and AMERICAN)
    if (diff > -1 && diff <= SECONDS_IN_A_DAY ) return false;

    return true;
}

const _loadFromGraph = (NFTOpt : NFTOpt, data : { requests : { id : number }[], options : { id : number }[] }) =>
{
    promises = [] as Promise<any>[];

    for (const r of data.requests) promises.push( loadOptionWithAsset(NFTOpt, r.id) );
    for (const o of data.options)  promises.push( loadOptionWithAsset(NFTOpt, o.id) );
}

const _loadFromLogs = async (NFTOpt : NFTOpt) : Promise<void> =>
{
    // Even though there is valid data, this fails for some reason, to retrive it -- suspect duplication in ID (42)
    // await NFTOpt.queryFilter(NFTOpt.filters["Withdrawn(uint256)"](42)));

    const published_promise = NFTOpt.queryFilter(NFTOpt.filters.Published());
    const withdrawn_promise = NFTOpt.queryFilter(NFTOpt.filters.Withdrawn());

    await Promise.all([published_promise, withdrawn_promise]);

    const published = await published_promise;
    let withdrawn   = await withdrawn_promise;
    if (withdrawn) withdrawn = withdrawn.reverse();

    // Reset cache
    promises = [] as Promise<any>[];

    let i        = -1;
    const length = published.length
    while (++i !== length)
    {
        const pev = published[i];
        const ID = pev.args[0].toString();

        const wev = withdrawn.find( (w : any) => w.args[0].toString() === ID );

        if (wev && wev.blockNumber >= pev.blockNumber) continue;

        promises.push( loadOptionWithAsset(NFTOpt, parseInt(ID)) );
    }
}

const _setOptionState = (ID: number, state : OptionState) : void =>
{
    for (let o of options)
    {
        if (o.id !== ID) continue;

        o.state = state;
        optionsChanged.value = true;

        break;
    }
}

let promises = [] as Promise<any>[];
