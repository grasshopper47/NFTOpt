import { getCachedContract } from "./contracts";
import { AssetKey, stringOf } from "../../models/assetKey";

export let images = {} as any;

export const clearImages = () => images = {};
export const imageOf     = (key : AssetKey) => images[stringOf(key)] as string;

export const loadImage = async(key : AssetKey, contract = getCachedContract(key.nftContract)) =>
{
    const key_str = stringOf(key);

    // Reuse from cache when loading or already loaded
    if (images[key_str]) return await images[key_str];

    console.log("loadImage");

    images[key_str] =
    (
        async () =>
        {
            const data  = await contract.tokenURI(key.nftId);
            const image = await JSON.parse(data).image;

            images[key_str] = image;

            return image;
        }
    )();

    return await images[key_str];
}
