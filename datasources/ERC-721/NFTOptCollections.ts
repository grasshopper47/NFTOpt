import { ethers } from "ethers";
import addresses from "../../addresses.json";
import { NFTAsset } from "../../models/NFTAsset";
import { ABIs } from "../../utils/constants";
import { contracts } from "../NFTOpt";
import { provider, network } from "../provider";
import { addContractToCache } from "./contracts";

let NFTOptCollections = [] as NFTAsset[];

export const clearNFTOptCollections = () =>
{
    NFTOptCollections = [] as NFTAsset[];

    for (const k of Object.keys(contracts.Collections)) contracts.Collections[k].removeAllListeners();
    contracts.Collections = { };
}

export const createNFTOptCollectionsInstances = () =>
{
    let collections = { ... addresses[network ?? -1] };
    delete collections.NFTOpt;

    let collectionKeys = Object.keys(collections);

    for (let k of collectionKeys)
    {
        const address = collections[k];

        const NFTContract =
        new ethers.Contract
        (
            address
        ,   [
                ABIs.ERC721.name
            ,   ABIs.ERC721.ownerOf
            ,   ABIs.ERC721.tokenURI
            ,   ABIs.ERC721.getApproved
            ,   ABIs.ERC721.approve
            ,   ABIs.ERC721.mint
            ,   ABIs.ERC721.Events.Approval
            ,   ABIs.ERC721.Events.Transfer
            ]
        ,   provider
        );

        contracts.Collections[k] = NFTContract;
        addContractToCache(address, NFTContract);
    }
}

export const loadNFTOptCollectionsItems = async () =>
{
    NFTOptCollections = [] as NFTAsset[];

    let collections = { ... addresses[network ?? -1] };
    delete collections.NFTOpt;

    let collectionKeys = Object.keys(collections);

    let promises : Promise<any>[] = [];
    for (let k of collectionKeys) promises.push( _loadCollectionItem(k) );
    await Promise.allSettled(promises);

    return NFTOptCollections;
}

const _loadCollectionItem = async (name : string ) =>
{
    let NFTContract = contracts.Collections[name];

    let promises =
    [
        NFTContract.name()
    ,   NFTContract.tokenURI(9999).then(r => JSON.parse(r).image)
    ];

    await Promise.allSettled(promises);

    NFTOptCollections.push
    ({
        key   : { nftContract: NFTContract.address, nftId: "9999" }
    ,   name  : await promises[0]
    ,   image : await promises[1]
    });
}
