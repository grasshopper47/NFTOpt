import { getCachedContract } from "./contracts";
import { AssetKey, stringOf } from "../../models/assetKey";

export let images : any = {};
export const clearImages = () => images = {};
export const imageOf = (obj : AssetKey) => images[stringOf(obj)] as string;

export async function loadImage(key : AssetKey)
{
    console.log("loadImage");
    let contract = getCachedContract(key.nftContract);

    let data = await contract.tokenURI(key.nftId);
    let image = JSON.parse(data).image;

    images[key.nftId + "_" + key.nftContract] = image;

    return image;
}
