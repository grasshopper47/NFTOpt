import { BigNumber } from "ethers";
import { NFTOpt, ERC721 } from "../../typechain-types";
import { NFTAsset, Option, OptionWithAsset, Option_SOLIDITY } from "./types";
import { ADDRESS0, SECONDS_IN_A_DAY } from "./constants";
import { getSignedContract } from "./metamask";

function isOptionValid(option: any): boolean {
    return !(
        option.buyer === ADDRESS0 ||
        option.nftContract === ADDRESS0 ||
        option.nftId === BigNumber.from("0") ||
        option.nftId === undefined ||
        option.premium === "0" ||
        option.strikePrice === "0" ||
        option.interval === 0
    );
}

export async function loadOption(contract: NFTOpt, id: number): Promise<Option> {
    const optionSolidity = await contract.options(id) as unknown as Option_SOLIDITY;

    if (!isOptionValid(optionSolidity)) { return null; }

    const option: Option = {
        id: id,
        ...optionSolidity,
    };

    option.buyer = option.buyer.toLowerCase();
    option.seller = option.seller.toLowerCase();
    option.interval = option.interval / SECONDS_IN_A_DAY;

    return option;
}

export async function loadOptions(contract: NFTOpt): Promise<Option[]> {
    let options: Option[] = [];

    const optionIDPromise = await contract.optionID();

    if (!optionIDPromise) { return; }

    // TODO: handle optionsLength > 2^53
    const optionsLength = optionIDPromise.toNumber();

    for (let id = 1; id <= optionsLength; ++id) {
        const optionSolidity = await contract.options(id) as unknown as Option_SOLIDITY;
        if (!isOptionValid(optionSolidity)) { continue; }

        const option = await loadOption(contract, id);
        if (!option) { continue; }

        options.push(option);
    }

    return options;
}

export async function loadAssetForOption(option: Option): Promise<NFTAsset> {

    const abi_IERC721 = [
        {
            "inputs": [],
            "name": "name",
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

    const NFTContract = getSignedContract(option.nftContract, abi_IERC721);

    const name = (await NFTContract.name()) + " - " + option.nftId.toString();
    const data = await NFTContract.tokenURI(option.nftId);

    return {
        id: option.id,
        tokenId: option.nftId,
        address: option.nftContract,
        name: name,
        image: JSON.parse(atob(data.slice(29))).image,
    };
}

export async function loadOptionWithAsset(contract: NFTOpt, id: number): Promise<OptionWithAsset> {
    let option: Option = await loadOption(contract, id);

    if (!option) { return null; }

    return {
        ...option,
        asset: await loadAssetForOption(option),
    }
}

export async function loadOptionsWithAsset(contract: NFTOpt): Promise<OptionWithAsset[]> {

    const options: OptionWithAsset[] = [];

    const optionIDPromise = await contract.optionID();

    if (!optionIDPromise) { return; }

    // TODO: handle optionsLength > 2^53
    const optionsLength = optionIDPromise.toNumber();

    for (let id = 0; id !== optionsLength; ++id) {

        const option = await loadOption(contract, id)
        if (!option) { continue; }

        options.push({
            ...option,
            asset: await loadAssetForOption(option)
        });
    }

    return options;
}