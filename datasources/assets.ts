
import { NFTAsset } from "../models/nftAsset";
import { AssetKey, stringOf } from "../models/assetKey";
import { images, loadImage } from "./ERC-721/images";
import { getCachedContract } from "./ERC-721/contracts";
import { MAX_MINTABLE_TOKENS } from "../utils/constants";
import addresses from "../addresses.json";

let assets = {};

export const clearAssets = () => assets = {};
export const clearAssetsOf = (account : string) => assets[account] = [] as NFTAsset[];
export const assetsOf = (account : string) => assets[account] as NFTAsset[];
export const addAssetTo = (account: string, obj : NFTAsset) => assets[account].push(obj);

export const addAssetByKeyTo = async (account: string, key : AssetKey) =>
{
    await getNFTAsset(key).then(asset => assets[account].push(asset));
}

export const getNFTAsset = async (key : AssetKey, contract? : any) =>
{
    let NFTContract = contract ?? getCachedContract(key.nftContract);

    // Re-use the image from cache, when available
    let cache = images[stringOf(key)];

    let promises =
    [
        NFTContract.name().then( (r : string) => `${r} - ${key.nftId}` )
    ,   cache ?? loadImage(key)
    ];

    await Promise.allSettled(promises);

    return {
        key   : key
    ,   name  : await promises[0]
    ,   image : await promises[1]
    } as NFTAsset;
}

export const loadAssetsFor = async (account: string) =>
{
    if (!account || assets[account]) return;

    console.log("loadAssetsFor", account);

    let arr      : NFTAsset[]     = [];
    let promises : Promise<any>[] = [];

    for (let name of Object.keys(addresses.localhost))
    {
        if (name === "NFTOpt") continue;

        for (let i = 1; i != MAX_MINTABLE_TOKENS; ++i)
        {
            promises.push
            (
                (async (key : AssetKey) =>
                {
                    let contract = getCachedContract(key.nftContract);

                    let owner = await contract.ownerOf(key.nftId);
                    if (owner.toLowerCase() !== account) return;

                    let asset = await getNFTAsset(key, contract);
                    arr.push(asset);
                })
                ({
                    nftId       : i.toString()
                ,   nftContract : addresses.localhost[name]
                })
            );
        }
    }

    await Promise.allSettled(promises);

    assets[account] = arr;

    return arr;
}
