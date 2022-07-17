import addresses from "../../../addresses.json";
import { MAX_MINTABLE_TOKENS } from "../../utils/constants";
import { AssetKey, NFTAsset } from "../../models/NFTAsset";
import { getCachedContract, assets } from "../NFTAssets";

export async function loadAssetsFor(account: string)
{
    console.log("loadAssetsFor");

    let arr      : NFTAsset[]     = [];
    let promises : Promise<any>[] = [];

    for (let name of Object.keys(addresses["localhost"]))
    {
        if (name === "NFTOpt") continue;

        for (let i = 1; i != MAX_MINTABLE_TOKENS; ++i)
        {
            promises.push
            (
                (async (key : AssetKey) =>
                {
                    let contract = getCachedContract(key.nftContract);

                    let owner = await contract.ownerOf(key.nftId);
                    if (owner.toLowerCase() !== account) return;

                    arr.push
                    ({
                        key   : key
                    ,   name  : await contract.name() + " - " + key.nftId.toString()
                    ,   image : ""
                    });
                })
                ({
                    nftId       : i.toString()
                ,   nftContract : addresses["localhost"][name]
                })
            );
        }
    }

    await Promise.allSettled(promises);

    assets[account] = arr;

    return arr;
}
