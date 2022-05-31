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

export async function fetchAssetsOfAccount(account: string, setAssetsCallback: (assets: NFTAsset[]) => void)
{
    const assets: NFTAsset[] = [];

    let j = 0;
    for (const name of Object.keys(addresses["localhost"]))
    {
        if (name === "NFTOpt") { continue; }

        const address = addresses["localhost"][name];

        const NFTContract = getSignedContract(address, [ ABIs.ERC721.ownerOf, ABIs.ERC721.name ]);

        for (let i = 1; i < MAX_MINTABLE_TOKENS; ++i)
        {
            var data = await NFTContract.ownerOf(i);

            data = data.toLowerCase();

            if (data === account) {
                const _tokenId = BigNumber.from(i);

                assets.push({
                    id: i + j * MAX_MINTABLE_TOKENS,
                    tokenId: _tokenId,
                    address: address,
                    name: await NFTContract.name() + " #" + _tokenId,
                    image: null,
                });
            }
        }

        ++j;
    }

    setAssetsCallback(assets);
}