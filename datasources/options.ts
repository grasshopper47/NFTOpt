import { OptionFlavor, OptionState } from "../models/enums";
import { Option, OptionWithAsset } from "../models/option";
import { NFTOpt, PublishedEvent, WithdrawnEvent } from "../typechain-types/contracts/NFTOpt";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../utils/constants";
import { getNFTAsset } from "./assets";
import { fetchFromGraphNode } from "./graph";

export const requestsChanged = { value : false };
export const optionsChanged  = { value : false };

export let requests : OptionWithAsset[] = [];
export let options  : OptionWithAsset[] = [];

export const clearRequests = () => requests = [];
export const clearOptions  = () => options  = [];

export const loadOptions = async (NFTOpt : NFTOpt) : Promise<void> =>
{
    const json = await fetchFromGraphNode
    (
        "NFTOpt"
    ,   "{ requests { id } options { id } }"
    );

    const isOK = json !== "" && (json.data.requests || json.data.options);

    console.log("loadOptions", isOK ? "graph" : "logs");

    // Reset cache
    clearRequests();
    clearOptions();
    promises = [] as Promise<any>[];

    if (isOK) _loadFromGraph(NFTOpt, json.data);
    else      await _loadFromLogs(NFTOpt);

    await Promise.all(promises);
}

export const loadOptionWithAsset = async (NFTOpt : NFTOpt, ID : number | string) : Promise<void> =>
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
    const timeNow    = new Date().getTime() * 0.001;
    const timeExpiry = option.startDate.toNumber() + option.interval * SECONDS_IN_A_DAY;
    const diff       = timeExpiry - timeNow;

    // Can exercise any time before & including the end day (AMERICAN)
    if (option.flavor === OptionFlavor.AMERICAN) return diff < 0;

    // Can exercise only on the end day (both EUROPEAN and AMERICAN)
    if (diff > -1 && diff <= SECONDS_IN_A_DAY ) return false;

    return true;
}

const _loadFromGraph = (NFTOpt : NFTOpt, data : { requests : { id : string }[], options : { id : string }[] }) =>
{
    promises = [] as Promise<any>[];

    for (const r of data.requests) promises.push( loadOptionWithAsset(NFTOpt, parseInt(r.id)) );
    for (const o of data.options)  promises.push( loadOptionWithAsset(NFTOpt, parseInt(o.id)) );
}

const _loadFromLogs = async (NFTOpt : NFTOpt) : Promise<void> =>
{
    // Even though there is valid data, this fails for some reason, to retrive it -- suspect duplication in ID (42)
    // await NFTOpt.queryFilter(NFTOpt.filters["Withdrawn(uint256)"](42)));

    let published = [] as PublishedEvent[];
    let withdrawn = [] as WithdrawnEvent[];

    await Promise.all
([
        NFTOpt.queryFilter(NFTOpt.filters.Published()).then( p => published = p )
    ,   NFTOpt.queryFilter(NFTOpt.filters.Withdrawn()).then( w => withdrawn = w.reverse() )
    ]);

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

        promises.push( loadOptionWithAsset(NFTOpt, ID) );
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
