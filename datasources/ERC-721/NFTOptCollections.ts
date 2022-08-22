import addresses from "../../addresses.json";
import { NFTAsset } from "../../models/NFTAsset";
import { ABIs } from "../../utils/constants";
import { contracts } from "../NFTOpt";
import { network } from "../provider";
import { getCachedContract } from "./contracts";

export let NFTOptCollections = [] as NFTAsset[];

export const clearNFTOptCollections = () =>
{
    NFTOptCollections = [] as NFTAsset[];

    for (const k of Object.keys(contracts.Collections)) contracts.Collections[k].removeAllListeners();
    contracts.Collections = {};
}

export const createNFTOptCollectionsInstances = () =>
{
    const collections = { ... addresses[network ?? -1] };
    delete collections.NFTOpt;

    const names = Object.keys(collections);

    for (const n of names) contracts.Collections[n] = getCachedContract(collections[n], [ ABIs.ERC721.mint ]);
}

export const loadNFTOptCollectionsItems = async () =>
{
    NFTOptCollections = [] as NFTAsset[];

    const collections = { ... addresses[network ?? -1] };
    delete collections.NFTOpt;

    const names = Object.keys(collections);

    const promises : Promise<any>[] = [];
    for (const n of names) promises.push( _loadCollectionItem(n) );
    await Promise.all(promises);

    return NFTOptCollections;
}

const _loadCollectionItem = async (name : string) =>
{
    // Get the contract's minted NFT (9999) token image
    const NFTContract = contracts.Collections[name];

    const NFTAsset =
    {
        key   : { nftContract: NFTContract.address, nftId: "9999" }
    ,   name  : ""
    ,   image : ""
    } as NFTAsset;

    const promises =
    [
        NFTContract.name()
        .then( (n : string) => NFTAsset.name = n )

    ,   NFTContract.tokenURI(9999)
        .then( (r : string) => JSON.parse(r) )
        .then( (o : any)    => NFTAsset.image = o.image )
    ];

    await Promise.all(promises);

    NFTOptCollections.push(NFTAsset);
}
