import { ethers } from "ethers";
import { provider } from "../src/utils/metamask";
import { AssetKey, NFTAsset } from "../models/nftAsset";
import { ABIs } from "../utils/constants";

export let images = {};
export let assets = {};

let NFTContractsCache = {};

export const clearContractsAndAssets = () => NFTContractsCache = images = assets = {};

export const isValid = (key : AssetKey) =>
{
    return key.nftContract.length === 42
        && key.nftContract.slice(0,2) =="0x"
        && key.nftId !== ""
};

export const stringOf = (obj : AssetKey )  => obj.nftId + "_" + obj.nftContract;
export const imageOf  = (obj : AssetKey)   => images[stringOf(obj)] as string;
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

export async function loadNFTImage(key : AssetKey)
{
    console.log("loadNFTImage");
    let contract = getCachedContract(key.nftContract);

    let data = await contract.tokenURI(key.nftId);
    let image = JSON.parse(data).image;

    images[key.nftId + "_" + key.nftContract] = image;

    return image;
}

export async function getNFTAsset(key : AssetKey)
{
    let NFTContract = getCachedContract(key.nftContract);

    let promises =
    [
        /* name  */ NFTContract.name().then(r => r + " - " + key.nftId)
    ,   /* image */ NFTContract.tokenURI(key.nftId).then(r => JSON.parse(r).image)
    ];

    // Use the image from cache, if available
    let cache = images[stringOf(key)];
    if (cache) promises[1] = cache;

    await Promise.allSettled(promises);

    return {
        key   : { ... key }
    ,   name  : await promises[0]
    ,   image : await promises[1]
    } as NFTAsset;
}
