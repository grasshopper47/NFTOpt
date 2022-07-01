import { BigNumber } from "ethers";
import { NFTAsset } from "../models/nftAsset";
import { getCachedContract, images, keyOf } from "./globals";

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