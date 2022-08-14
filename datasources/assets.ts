
import { NFTAsset } from "../models/NFTAsset";
import { AssetKey, stringOf } from "../models/assetKey";
import { images, loadImage } from "./ERC-721/images";
import { getCachedContract } from "./ERC-721/contracts";
import addresses from "../addresses.json";

export const clearAssets   = () => assets = {};
export const clearAssetsOf = (account : string) => assets[account] as NFTAsset[];
export const assetsOf      = (account : string) => assets[account] as NFTAsset[];
export const addAssetTo    = (account: string, obj : NFTAsset) => assets[account].push(obj);

export const addAssetByKeyTo = async (account: string, key : AssetKey) =>
{
    await getNFTAsset(key).then(asset => assets[account].push(asset));
}

export const getNFTAsset = async (key : AssetKey, contract? : any) =>
{
    let NFTContract = contract ?? getCachedContract(key.nftContract, provider);

    // Re-use the image from cache, when available
    let cache = images[stringOf(key)];

    let promises =
    [
        NFTContract.name().then( (r : string) => `${r} - ${key.nftId}` )
    ,   cache ?? loadImage(key, provider)
    ];

    await Promise.allSettled(promises);

    return {
        key   : key
    ,   name  : await promises[0]
    ,   image : await promises[1]
    } as NFTAsset;
}

export const loadAssetsFor = async (account : string, _provider : any) =>
{
    if (!account || account === " " || assets[account]) return;

    console.log("loadAssetsFor", account);

    // Reset cache
    arr      = [] as NFTAsset[];
    promises = [] as Promise<any>[];
    provider = _provider;

    // Fetch from Graph
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

        // Force loading from localhost on fetch or Graph query error
        json = "{}";
    }

    // Prepare asset data loading promises
    (json !== "{}" && json.data.account)
    ?   _loadFromGraph(json.data.account.tokens, account)
    : await _loadFromLogs(account);

    // Wait for assets to load
    await Promise.allSettled(promises);

    assets[account] = arr;

    return arr;
}

function _loadFromGraph(tokens : {identifier : string, contract : string}[], account : string)
{
    for (let t of tokens)
    {
        promises.push
        (
            _loadAssetData
            (
                {
                    nftId       : t.identifier
                ,   nftContract : t.contract
                }
            ,   account
            )
        );
    }
}

async function _loadFromLogs(account : string)
{
    for (let name of Object.keys(addresses.localhost))
    {
        if (name === "NFTOpt") continue;

        let contract = getCachedContract((addresses.localhost as any)[name], provider);

        let received = contract.queryFilter(contract.filters.Transfer(null,account));
        let sent     = contract.queryFilter(contract.filters.Transfer(account));

        await Promise.allSettled([received, sent]);

        // Collapse promises
        received = await received;
        sent     = await sent;

        for (let r of received)
        {
            let tokenID = r.args[2].toString();

            if ( sent.find( (s : any) => s.args[2].toString() === tokenID ) ) continue;

            promises.push
            (
                _loadAssetData
                (
                    {
                        nftId       : tokenID
                    ,   nftContract : contract.address
                    }
                ,   account
                )
            );
        }
    }
}

async function _loadAssetData(key : AssetKey, account : string)
{
    let contract = getCachedContract(key.nftContract, provider);

    let owner = await contract.ownerOf(key.nftId);
    if (owner !== account) return;

    let asset = await getNFTAsset(key, contract);
    arr.push(asset);
}

let arr      : NFTAsset[]     = [];
let promises : Promise<any>[] = [];
let provider : any = {};

let assets : any = {};
