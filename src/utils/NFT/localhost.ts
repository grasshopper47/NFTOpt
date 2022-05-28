import {BigNumber} from "ethers";
import {NFTAsset, Option, OptionWithNFTDetails} from "../types";
import {getSignedContract, getTXOptions} from "../metamask";
import addresses from "../../../addresses.json";

export async function fetchNFTImage(address: string, id: BigNumber) {
    const abi_IERC721: any = [
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "tokenURI",
            outputs: [
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ];

    let NFTContract = getSignedContract(address, abi_IERC721);

    var data = await NFTContract.tokenURI(id, await getTXOptions());

    return JSON.parse(atob(data.slice(29))).image;
}

export async function fetchAssetsForAddress(account: string, setAssetsCallback: (assets: NFTAsset[]) => void) {
    const assets: NFTAsset[] = [];

    const abi_IERC721: any = [
        {
            inputs: [
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            name: "ownerOf",
            outputs: [
                {
                    internalType: "address",
                    name: "",
                    type: "address",
                },
            ],
            stateMutability: "view",
            type: "function",
        },
    ];

    const NFTContractAddress = addresses["localhost"].NFTDummy;
    let NFTContract = getSignedContract(NFTContractAddress, abi_IERC721);

    for (let i = 1; i < 6; ++i) {
        var data = await NFTContract.ownerOf(i, await getTXOptions());

        data = data.toLowerCase();

        if (data === account) {
            const id = BigNumber.from(i);
            assets.push({
                tokenId: id,
                address: NFTContractAddress,
                name: "X Collection - " + i,
                image: await fetchNFTImage(NFTContractAddress, id),
                url: "",
            });
        }
    }

    const NFTContractAddress1 = addresses["localhost"].NFTJW;
    let NFTContract1 = getSignedContract(NFTContractAddress, abi_IERC721);

    for (let i = 1; i < 6; ++i) {
        var data = await NFTContract1.ownerOf(i, await getTXOptions());

        data = data.toLowerCase();

        if (data === account) {
            const id = BigNumber.from(i + 5);
            assets.push({
                tokenId: id,
                address: NFTContractAddress1,
                name: "Y Collection - " + i,
                image: await fetchNFTImage(NFTContractAddress1, id),
                url: "",
            });
        }
    }

    setAssetsCallback(assets);
}

export async function fetchNFTDetailsForMultipleOptions(options: Option[]): Promise<OptionWithNFTDetails[]> {
    const optionsWithNFTDetails: OptionWithNFTDetails[] = [];
    let asset: NFTAsset | null = null;

    for (let option of options) {
        asset = {
            tokenId: option.nftId,
            address: option.nftContract,
            name: `Option ${option.id}`,
            image: await fetchNFTImage(option.nftContract, option.nftId),
            url: "https://freesvg.org/img/Placeholder.png",
        };

        optionsWithNFTDetails.push({
            ...option,
            asset,
        });
    }

    return optionsWithNFTDetails;
}
