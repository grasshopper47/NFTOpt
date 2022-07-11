import { BigNumber, ethers } from "ethers";
import { provider } from "../frontend/utils/metamask";
import { NFTAsset } from "../models/nftAsset";
import { ABIs } from "../utils/constants";

type minObj = { nftId : BigNumber, nftContract : string };

export let images = {};
export let assets = {};

export let NFTContractsCache = {};

export const clearContractsAndAssets = () => NFTContractsCache = images = assets = {};

export const keyOf    = (obj : minObj )    => obj.nftId + "_" + obj.nftContract;
export const imageOf  = (obj : minObj)     => images[keyOf(obj)] as string;
export const assetsOf = (account : string) => assets[account] as NFTAsset[];

export function getCachedContract(address : string)
{
    let contract = NFTContractsCache[address];

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

    NFTContractsCache[address] = contract;

    return contract;
}


export async function loadNFTImage(address: string, id: BigNumber)
{
    console.log("loadNFTImage");
    let contract = getCachedContract(address);

    let data = await contract.tokenURI(id);

    let image = JSON.parse(data).image;

    images[id.toString() + "_" + address] = image;

    return image;
}

export async function getNFTAsset(option: { nftId : BigNumber, nftContract : string })
{
    let NFTContract = getCachedContract(option.nftContract);

    let promises =
    [
        /* name  */ NFTContract.name().then(r => r + " - " + option.nftId.toString())
    ,   /* image */ NFTContract.tokenURI(option.nftId).then(r => JSON.parse(r).image)
    ];

    // Use the image from cache, if available
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
