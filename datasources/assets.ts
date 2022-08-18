
import addresses from "../addresses.json";
import { AssetKey } from "../models/assetKey";
import { imageOf, loadImage } from "./ERC-721/images";
import { getCachedContract } from "./ERC-721/contracts";
import { NFTAsset } from "../models/NFTAsset";

export const clearAssets   = () => assets = {} as any;
export const assetsOf      = (account : string) => assets[account] as NFTAsset[];
export const addAssetTo    = (account: string, obj : NFTAsset) => assets[account].push(obj);

export const addAssetByKeyTo = async (account: string, key : AssetKey) =>
{
    await getNFTAsset(key).then(asset => assets[account].push(asset));
}

export const getNFTAsset = async (key : AssetKey, contract? : any) =>
{
    const NFTContract = contract ?? getCachedContract(key.nftContract);

    const promises =
    [
        NFTContract.name().then( (r : string) => `${r} - ${key.nftId}` )
    ,   imageOf(key) ?? loadImage(key)  // load image async when not in cache
    ];

    await Promise.all(promises);

    return {
        key   : key
    ,   name  : await promises[0]
    ,   image : imageOf(key)
    } as NFTAsset;
}

export const loadAssetsFor = async (account : string) =>
{
    if (!account || account === " " || assets[account]) return;

    console.log("loadAssetsFor", account);

    // Reset cache
    arr      = [] as NFTAsset[];
    promises = [] as Promise<any>[];

    // Fetch from Graph
    const reply = await fetch
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
        for (const e of json.errors) console.error(e.message);

        // Force loading from localhost on error (due to missing host on fetch or in the Graph query itself)
        json = "{}";
    }

    // Prepare asset data loading promises
    if (json !== "{}" && json.data.account) _loadFromGraph(json.data.account.tokens, account)
    else                                    await _loadFromLogs(account);

    // Wait for assets to load
    await Promise.all(promises);

    assets[account] = arr;

    return arr;
}

const _loadFromGraph = (tokens : { identifier : string, contract : string }[], account : string) =>
{
    for (const t of tokens)
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

const _loadFromLogs = async(account : string) =>
{
    for (const name of Object.keys(addresses.localhost))
    {
        if (name === "NFTOpt") continue;

        const contract = getCachedContract((addresses.localhost as any)[name]);

        const received_promise = contract.queryFilter(contract.filters.Transfer(null, account));
        const sent_promise     = contract.queryFilter(contract.filters.Transfer(account));

        await Promise.all([received_promise, sent_promise]);

        // Collapse promises
        const received = await received_promise;
        const sent     = await sent_promise;

        for (const r of received)
        {
            const tokenID = r.args[2].toString();

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

const _loadAssetData = async(key : AssetKey, account : string) =>
{
    const contract = getCachedContract(key.nftContract);

    const owner = await contract.ownerOf(key.nftId);
    if (owner !== account) return;

    const asset = await getNFTAsset(key, contract);
    arr.push(asset);
}

let arr      = [] as NFTAsset[];
let promises = [] as Promise<any>[];

let assets = {} as any;
