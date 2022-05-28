import { BigNumber } from "ethers";
import { NFTAsset, Option, OptionWithAsset } from "../types";
import { getSignedContract, getTXOptions } from "../metamask";
import addresses from "../../../addresses.json";
import { MAX_MINTABLE_TOKENS } from "../constants";

const abi_IERC721 = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256",
            },
        ],
        "name": "ownerOf",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address",
            },
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tokenId",
                "type": "uint256",
            },
        ],
        "name": "tokenURI",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string",
            },
        ],
        "stateMutability": "view",
        "type": "function",
    },
];

export async function fetchNFTImage(address: string, id: BigNumber) {
    let NFTContract = getSignedContract(address, abi_IERC721);

    var data = await NFTContract.tokenURI(id, await getTXOptions());

    return JSON.parse(atob(data.slice(29))).image;
}

export async function fetchAssetsForAddress(account: string, setAssetsCallback: (assets: NFTAsset[]) => void) {
    const assets: NFTAsset[] = [];

    const contractNames = Object.keys(addresses["localhost"]);

    let j = -1;
    for (const name of contractNames) {
        if (name === "NFTOpt") { continue; }

        const NFTContractAddress = addresses["localhost"][name];

        const NFTContract = getSignedContract(NFTContractAddress, abi_IERC721);

        for (let i = 1; i < MAX_MINTABLE_TOKENS; ++i) {
            var data = await NFTContract.ownerOf(i, await getTXOptions());

            data = data.toLowerCase();

            if (data === account) {
                const _tokenId = BigNumber.from(i);
                assets.push({
                    id: i + j * MAX_MINTABLE_TOKENS,
                    tokenId: _tokenId,
                    address: NFTContractAddress,
                    name: await NFTContract.name() + " - " + _tokenId,
                    image: await fetchNFTImage(NFTContractAddress, _tokenId),
                });
            }
        }

        ++j;
    }

    setAssetsCallback(assets);
}

export async function fetchNFTDetailsForMultipleOptions(options: Option[]): Promise<OptionWithAsset[]> {
    const optionsWithAsset: OptionWithAsset[] = [];

    for (let option of options) {

        const NFTContract = getSignedContract(option.nftContract, abi_IERC721);

        optionsWithAsset.push({
            ...option,
            asset: {
                id: option.id,
                tokenId: option.nftId,
                address: option.nftContract,
                name: await NFTContract.name() + " - " + option.nftId,
                image: await fetchNFTImage(option.nftContract, option.nftId),
            },
        });
    }

    return optionsWithAsset;
}