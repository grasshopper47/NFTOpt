import { BigNumber } from "ethers";
import addresses from "../../../addresses.json";
import { MAX_MINTABLE_TOKENS } from "../../utils/constants";
import { NFTAsset } from "../../models/NFTAsset";
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
                (async (address : string, tokenID : number) =>
                {
                    let contract = getCachedContract(address);

                    let owner = await contract.ownerOf(tokenID);
                    if (owner.toLowerCase() !== account) return;

                    arr.push
                    ({
                        nftId       : BigNumber.from(tokenID)
                    ,   nftContract : address
                    ,   name        : await contract.name() + " - " + tokenID.toString()
                    ,   image       : ""
                    });
                })
                (addresses["localhost"][name], i)
            );
        }
    }

    await Promise.allSettled(promises);

    assets[account] = arr;

    return arr;
}
