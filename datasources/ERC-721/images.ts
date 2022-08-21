import { getCachedContract } from "./contracts";
import { AssetKey, stringOf } from "../../models/assetKey";

export let images : any = {};
export const clearImages = () => images = {};
export const imageOf     = (key : AssetKey) => images[stringOf(key)] as string;

export const loadImage = async(key : AssetKey, contract = getCachedContract(key.nftContract)) =>
{
    console.log("loadImage");

    const data = await contract.tokenURI(key.nftId);
    images[stringOf(key)] = JSON.parse(data).image;
}
