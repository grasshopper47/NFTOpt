import { BigNumber } from "ethers";
import { NFTAsset } from "../types";
import { getSignedContract } from "../metamask";
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
    // const abi_IERC721 = [
    //     {
    //         "inputs": [
    //             {
    //                 "internalType": "uint256",
    //                 "name": "tokenId",
    //                 "type": "uint256",
    //             },
    //         ],
    //         "name": "tokenURI",
    //         "outputs": [
    //             {
    //                 "internalType": "string",
    //                 "name": "",
    //                 "type": "string",
    //             },
    //         ],
    //         "stateMutability": "view",
    //         "type": "function",
    //     },
    // ];

    let NFTContract = getSignedContract(address, abi_IERC721);

    var data = await NFTContract.tokenURI(id);

    return JSON.parse(atob(data.slice(29))).image;
}

export async function fetchAssetsOfAccount(account: string, setAssetsCallback: (assets: NFTAsset[]) => void) {
    const assets: NFTAsset[] = [];

    let j = 0;
    for (const name of Object.keys(addresses["localhost"])) {
        if (name === "NFTOpt") { continue; }

        const address = addresses["localhost"][name];

        const NFTContract = getSignedContract(address, abi_IERC721);

        for (let i = 1; i < MAX_MINTABLE_TOKENS; ++i) {
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