
import addresses from "../addresses.json";
import { AssetKey } from "../models/assetKey";
import { NFTAsset } from "../models/NFTAsset";
import { imageOf, loadImage } from "./ERC-721/images";
import { getCachedContract } from "./ERC-721/contracts";
import { fetchFromGraphNode } from "./graph";

export const clearAssets = () => assets = {} as any;
export const assetsOf    = (account : string) => assets[account] as NFTAsset[];
export const addAssetTo  = (account: string, obj : NFTAsset) => assets[account].push(obj);

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
    ,   imageOf(key) ?? loadImage(key)  // load image async when missing from cache
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

    const json = await fetchFromGraphNode
    (
        "NFTCollections"
    ,   `{ account (id:"${account}") { tokens { identifier contract } } }`
    );

    const isOK = json !== "" && json.data.account;

    console.log("loadAssetsFor", account, isOK ? "graph" : "logs");

    // Reset cache
    arr      = [] as NFTAsset[];
    promises = [] as Promise<any>[];

    if (isOK) _loadFromGraph(json.data.account.tokens, account)
    else      await _loadFromLogs(account);

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
