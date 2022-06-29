// @ts-ignore
import { NFTOpt } from "../../typechain-types";

import { OptionWithAsset } from "../models/extended";
import { getSignedContract } from "../frontend/utils/metamask";
import { ABIs, ADDRESS0, SECONDS_IN_A_DAY } from "../utils/constants";
import { BigNumber } from "ethers";
import { NFTAsset } from "../models/NFTAsset";
import { getNFTAsset } from "./NFTAssets";
import { getOption } from "./options";
import { OptionState } from "../models/option";
import { getRequest } from "./requests";

let _NFTOpt = {} as unknown as NFTOpt;

export const setContract = (contract_) => _NFTOpt = contract_;
export const NFTOptContract = () => _NFTOpt;

const contracts = { };

export let requests : OptionWithAsset[] = [];
export let options  : OptionWithAsset[] = [];

export const images = { };
export const assets = { };

type minObj = { nftId : BigNumber, nftContract : string };

export const keyOf    = (obj : minObj )    => obj.nftId + "_" + obj.nftContract;
export const imageOf  = (obj : minObj)     => images[keyOf(obj)] as string;
export const assetsOf = (account : string) => assets[account] as NFTAsset[];

export function getCachedContract(address : string)
{
    let contract = contracts[address];

    if (contract) return contract;

    contract =
    getSignedContract
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
    );

    contracts[address] = contract;

    return contract;
}

export async function loadRequestAsOptionWithAsset(id: number)
{
    let request = await getRequest(id);

    if (!request) return;

    requests.push
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

    options.push(option as unknown as OptionWithAsset);
}

export async function loadAllRequestsAsOptionsWithAsset()
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    requests = [];

    let IDPromise = await NFTOptContract().requestID();
    if (!IDPromise) return;

    // TODO: handle optionsLength > 2^53
    length = IDPromise.toNumber();

    id = -1;
    while (++id !== length)
    {
        promises.push( loadRequestAsOptionWithAsset(id).catch( e => console.log(e, `Request ${id} failed to fetch`) ) );
    }

    await Promise.allSettled(promises);

    requests.sort( (a, b) => a.id - b.id );
}

export async function loadAllOptionsWithAsset()
{
    let id     : number;
    let length : number;

    let promises : Promise<any>[] = [];

    options = [];

    let IDPromise = await NFTOptContract().optionID();
    if (!IDPromise) return;

    // TODO: handle optionsLength > 2^53
    length = IDPromise.toNumber();

    id = -1;
    while (++id !== length)
    {
        promises.push( loadOptionWithAsset(id).catch( e => console.log(e, `Option ${id} failed to fetch`) ) );
    }

    await Promise.allSettled(promises);

    options.sort( (a, b) => a.id - b.id );
}