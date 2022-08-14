
import { NFTAsset } from "../models/NFTAsset";
import { AssetKey, stringOf } from "../models/assetKey";
import { images, loadImage } from "./ERC-721/images";
import { getCachedContract } from "./ERC-721/contracts";
import { MAX_MINTABLE_TOKENS } from "../utils/constants";
import addresses from "../addresses.json";

export const clearAssets   = () => assets = {};
export const clearAssetsOf = (account : string) => assets[account] = [] as NFTAsset[];
export const assetsOf      = (account : string) => assets[account] as NFTAsset[];
export const addAssetTo    = (account: string, obj : NFTAsset) => assets[account].push(obj);

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
    if (!account || account === " " || assets[account]) return;

    console.log("loadAssetsFor", account);

    let arr      : NFTAsset[]     = [];
    let promises : Promise<any>[] = [];

    let isMissing = false;

    let reply = await fetch
    (
        "http://127.0.0.1:8000/subgraphs/name/NFTCollections"
    ,   {
            method : "POST"
        ,   body   : JSON.stringify({ query: `{ account (id:"${account}") { tokens { identifier contract } } }` })
        }
    )
    .catch( () => { return { json: () => "{}" } } );

    let json = await reply.json();

    if (json.errors)
    {
        for (let e of json.errors) console.error(e.message);

        // Force loading from localhost on Graph query error
        json = "{}";
    }

    if (json !== "{}")
    {
        // Load from Graph query result
        for (let t of json.data.account.tokens)
        {
            promises.push
            (
                _loadAssetByKey
                (
                    {
                        nftId       : t.identifier
                    ,   nftContract : t.contract
                    }
                ,   account
                ,   arr
                )
            );
        }
    }
    else
    {
        // Load from known addresses -- produces errors for missing token IDs
        for (let name of Object.keys(addresses.localhost))
        {
            if (name === "NFTOpt") continue;

            for (let i = 1; i != MAX_MINTABLE_TOKENS; ++i)
            {
                promises.push
                (
                    _loadAssetByKey
                    (
                        {
                            nftId       : i.toString()
                        ,   nftContract : addresses.localhost[name]
                        }
                    ,   account
                    ,   arr
                    )
                );
            }
        }
    }

    await Promise.allSettled(promises);

    assets[account] = arr;

    return arr;
}

async function _loadAssetByKey(key : AssetKey, account : string, arr : NFTAsset[])
{
    let contract = getCachedContract(key.nftContract);

    let owner = await contract.ownerOf(key.nftId);
    if (owner !== account) return;

    let asset = await getNFTAsset(key, contract);
    arr.push(asset);
}

let assets = {};
