import { BigNumber } from "ethers";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { NFTAsset, Option, OptionWithAsset, Option_SOLIDITY } from "./types";
import { ADDRESS0, SECONDS_IN_A_DAY } from "./constants";
import { fetchNFTImage } from "./NFT/localhost";
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

export async function loadAsset(contract: NFTOpt, optionId: number): Promise<NFTAsset> {
    const optionSolidity = await contract.options(optionId) as unknown as Option_SOLIDITY;

    if (!isOptionValid(optionSolidity)) { return; }

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
    ];

    const NFTContract = getSignedContract(optionSolidity.nftContract, abi_IERC721);

    return {
        id: optionId,
        tokenId: optionSolidity.nftId,
        address: optionSolidity.nftContract,
        name: (await NFTContract.name()) + " - " + optionSolidity.nftId.toString(),
        image: await fetchNFTImage(optionSolidity.nftContract, optionSolidity.nftId),
    };
}

export async function loadOptionWithAsset(contract: NFTOpt, optionId: number): Promise<OptionWithAsset> {
    let option = await loadOption(contract, optionId);

    if (!option) { return null; }

    return {
        id: optionId,
        ...option,
        asset: await loadAsset(contract, optionId),
    }
}