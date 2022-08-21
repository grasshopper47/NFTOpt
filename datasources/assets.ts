
import addresses from "../addresses.json";
import { AssetKey, stringOf } from "../models/assetKey";
import { NFTAsset } from "../models/NFTAsset";
import { images, loadImage } from "./ERC-721/images";
import { getCachedContract } from "./ERC-721/contracts";
import { fetchFromGraphNode } from "./graph";
import { TransferEvent } from "../typechain-types/@openzeppelin/contracts/token/ERC721/IERC721";

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

    const NFTAsset =
    {
        key   : key
    ,   name  : ""
    ,   image : ""
    } as NFTAsset;

    const promises = [ NFTContract.name().then( (r : string) => NFTAsset.name = `${r} - ${key.nftId}` ) ];

    const key_str = stringOf(key);

    // Trigger cache to load once per image
    if (images[key_str] === undefined) promises.push( loadImage(key) );

    await Promise.all(promises);

    NFTAsset.image = images[key_str];

    return NFTAsset;
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
    const contractNames = Object.keys(addresses.localhost);
    const length = contractNames.length;

    let name : string;
    let i = -1;
    while ( (name = contractNames[++i]) !== "NFTOpt" && i !== length )
    {
        const contract = getCachedContract((addresses.localhost as any)[name]);

        let received = [] as TransferEvent[];
        let sent     = [] as TransferEvent[];

        await Promise.all
        ([
            contract.queryFilter(contract.filters.Transfer(null, account)).then( r => received = r )
        ,   contract.queryFilter(contract.filters.Transfer(account)).then( s => sent = s )
        ]);

        let length = sent.length;

    loop_root:
        for (const r of received)
        {
            // Skip transfered tokens
            let i = -1;
            while (++i !== length)
            {
                if (sent[i].args[2].eq(r.args[2]))
                {
                    sent.splice(i, 1), --length;

                    continue loop_root;
                }
            }

            promises.push
            (
                _loadAssetData
                (
                    {
                        nftId       : r.args[2].toString()
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
