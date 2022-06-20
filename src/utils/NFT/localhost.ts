import { BigNumber } from "ethers";
import { NFTAsset } from "../types";
import { getSignedContract } from "../metamask";
import addresses from "../../../addresses.json";
import { ABIs, MAX_MINTABLE_TOKENS } from "../constants";

export async function fetchNFTImage(address: string, id: BigNumber)
{
    const NFTContract = getSignedContract(address, [ ABIs.ERC721.tokenURI ]);

    var data = await NFTContract.tokenURI(id);

    return JSON.parse(atob(data.slice(29))).image;
}

export async function fetchAssetsOfAccount(account: string)
{
    let assets   : NFTAsset[]     = [];
    let promises : Promise<any>[] = [];

    let j = 0;
    for (const name of Object.keys(addresses["localhost"]))
    {
        if (name === "NFTOpt") continue;

        const address_    = addresses["localhost"][name];
        const NFTContract = getSignedContract(address_, [ ABIs.ERC721.name, ABIs.ERC721.ownerOf ]);

        for (let i = 1; i != MAX_MINTABLE_TOKENS; ++i)
        {
            promises.push
            (
                (async () =>
                {
                    const owner = await NFTContract.ownerOf(i);
                    if (owner.toLowerCase() !== account) return;

                    const tokenID_ = BigNumber.from(i);

                    assets.push
                    ({
                        id      : i + j * MAX_MINTABLE_TOKENS
                    ,   tokenId : tokenID_
                    ,   address : address_
                    ,   name    : await NFTContract.name() + " #" + tokenID_
                    ,   image   : ""
                    });
                })()
            );
        }

        ++j;
    }

    await Promise.allSettled(promises);

    return assets.sort( a => a.id );
}