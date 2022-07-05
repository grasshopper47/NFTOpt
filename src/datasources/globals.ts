// @ts-ignore
import { NFTOpt } from "../../typechain-types";

import { BigNumber, ethers } from "ethers";
import { getNFTAsset } from "./NFTAssets";
import { getRequest } from "./requests";
import { getOption } from "./options";
import { NFTAsset } from "../models/NFTAsset";
import { OptionState } from "../models/option";
import { OptionWithAsset } from "../models/extended";
import { ABIs, ADDRESS0 } from "../utils/constants";
import { provider } from "../frontend/utils/metamask";

export let contracts = { NFTOpt: null as unknown as NFTOpt };

export let requests : OptionWithAsset[] = [];
export let options  : OptionWithAsset[] = [];

export let images = { };
export let assets = { };

type minObj = { nftId : BigNumber, nftContract : string };

export const keyOf    = (obj : minObj )    => obj.nftId + "_" + obj.nftContract;
export const imageOf  = (obj : minObj)     => images[keyOf(obj)] as string;
export const assetsOf = (account : string) => assets[account] as NFTAsset[];

let contractsCache = { };

export function clearData()
{
    requests = options = [];

    contractsCache = images = assets = {};

    contracts.NFTOpt?.removeAllListeners();
    contracts = { NFTOpt: null as unknown as NFTOpt };
}

export function getCachedContract(address : string)
{
    let contract = contractsCache[address];

    if (contract) return contract;

    contract =
    new ethers.Contract
    (
        address
    ,   [
            ABIs.ERC721.name
        ,   ABIs.ERC721.ownerOf
        ,   ABIs.ERC721.tokenURI
        ,   ABIs.ERC721.getApproved
        ,   ABIs.ERC721.approve
        ,   ABIs.ERC721.Events.Approval
        ]
    ,   provider()
    );

    contractsCache[address] = contract;

    return contract;
}

export async function loadRequestAsOptionWithAsset(id: number)
{
    let request = await getRequest(id);

    if (!request) return;

    requests.unshift
    (
        {
            id          : id
        ,   interval    : request.interval
        ,   premium     : request.premium
        ,   strikePrice : request.strikePrice
        ,   flavor      : request.flavor
        ,   buyer       : request.buyer
        ,   seller      : ADDRESS0
        ,   startDate   : 0
        ,   state       : OptionState.PUBLISHED
        ,   asset       : await getNFTAsset(request)
        } as OptionWithAsset
    );
}

export async function loadOptionWithAsset(id: number)
{
    let option = await getOption(id);

    option["asset"] = await getNFTAsset(option);

    // @ts-ignore
    delete option.nftContract; delete option.nftId;

    options.unshift(option as unknown as OptionWithAsset);
}

export async function loadAllRequestsAsOptionsWithAsset()
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    requests = [];

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

export async function loadAllOptionsWithAsset()
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    options = [];

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