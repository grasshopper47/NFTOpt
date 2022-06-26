import { BigNumber } from "ethers";
import { NFTAsset, OptionRequest, Option } from "../../utils/types";
import { getSignedContract } from "../../utils/metamask";
import addresses from "../../../addresses.json";
import { ABIs, MAX_MINTABLE_TOKENS } from "../../utils/constants";

const contracts = { };

export const images = { };
export const assets = { };

export const keyOf = (obj : OptionRequest | Option | NFTAsset) => obj.nftId + "_" + obj.nftContract;
export const imageOf = (obj : OptionRequest | NFTAsset) => images[keyOf(obj)] as string;
export const assetsOf = (account : string)  => assets[account] as NFTAsset[];

export function getCachedContract(address : string)
{
    let contract = contracts[address];

    if (contract) return contract;

    contract =
    getSignedContract
    (
        address
    ,   [
            ABIs.ERC721.name
        ,   ABIs.ERC721.ownerOf
        ,   ABIs.ERC721.tokenURI
        ,   ABIs.ERC721.getApproved
        ,   ABIs.ERC721.approve
        ,   ABIs.ERC721.Events.Approval
        ]
    );

    contracts[address] = contract;

    return contract;
}

export async function loadNFTImage(address: string, id: BigNumber)
{
    console.log("loadNFTImage");
    let contract = getCachedContract(address);

    let data = await contract.tokenURI(id);

    let image = JSON.parse(atob(data.slice(29))).image;

    images[id.toString() + "_" + address] = image;

    return image;
}

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
    //assets.sort( a => a.nftId + "_" + a.nftContract );
}