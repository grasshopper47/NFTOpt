import { getCachedContract } from "./contracts";
import { AssetKey, stringOf } from "../../models/assetKey";

export let images : any = {};
export const clearImages = () => images = {};
export const imageOf = (key : AssetKey) => images[stringOf(key)] as string;

export const loadImage = async(key : AssetKey, contract = getCachedContract(key.nftContract)) =>
{
    console.log("loadImage");

    const key_str = stringOf(key);
    images[key_str] = "";

    const data = await contract.tokenURI(key.nftId);
    const image = JSON.parse(data).image;

    images[key_str] = image;

    return image;
}
