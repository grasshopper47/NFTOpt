import { BigNumber } from "ethers";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { Option, OptionWithNFTDetails } from "./types";
import { addressEmpty, SECONDS_IN_A_DAY } from "./constants";
import { fetchNFTImage } from "./NFT/localhost";
import { getSignedContract } from "./metamask";

function isOptionValid(option: any): boolean {
    let isMalformed =
        option.buyer === addressEmpty ||
        option.nftContract === addressEmpty ||
        option.nftId === BigNumber.from("0") ||
        option.nftId === undefined ||
        option.premium === "0" ||
        option.strikePrice === "0" ||
        option.interval === 0;

    return !isMalformed;
}

export async function loadContractOptions(contract: NFTOpt): Promise<Option[]> {
    let options: Option[] = [];

    try {
        const optionIDPromise = await contract.optionID();

        if (!optionIDPromise) { return; }

        // TODO: handle optionsLength > 2^53
        const optionsLength = optionIDPromise.toNumber();

        for (let idx = 1; idx <= optionsLength; ++idx) {
            const optionSolidity = await contract.options(idx);

            if (!isOptionValid(optionSolidity)) { continue; }

            options.push({
                id: idx,
                buyer: optionSolidity.buyer.toLowerCase(),
                seller: optionSolidity.seller.toLowerCase(),
                flavor: optionSolidity.flavor,
                interval: optionSolidity.interval / SECONDS_IN_A_DAY,
                nftContract: optionSolidity.nftContract,
                nftId: optionSolidity.nftId,
                premium: optionSolidity.premium,
                startDate: optionSolidity.startDate.toNumber(),
                state: optionSolidity.state,
                strikePrice: optionSolidity.strikePrice,
            });
        }
    } catch (err) {
        console.error(err);
    }

    return options;
}

export async function loadOptionWithAsset(
    contract: NFTOpt,
    optionId: number
): Promise<OptionWithNFTDetails> {
    let option: OptionWithNFTDetails = null;

    try {
        const optionSolidity = await contract.options(optionId);

        if (!isOptionValid(optionSolidity)) { return; }

        const abi_IERC721 = [
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
        ];

        const NFTContract = getSignedContract(optionSolidity.nftContract, abi_IERC721);

        option = {
            id: optionId,
            buyer: optionSolidity.buyer.toLowerCase(),
            seller: optionSolidity.seller.toLowerCase(),
            flavor: optionSolidity.flavor,
            interval: optionSolidity.interval / SECONDS_IN_A_DAY,
            premium: optionSolidity.premium,
            startDate: optionSolidity.startDate.toNumber(),
            state: optionSolidity.state,
            strikePrice: optionSolidity.strikePrice,
            asset: {
                id: optionId,
                tokenId: optionSolidity.nftId,
                address: optionSolidity.nftContract,
                name: await NFTContract.name() + " - " + optionSolidity.nftId.toString(),
                image: await fetchNFTImage(optionSolidity.nftContract, optionSolidity.nftId),
            },
        };
    } catch (err) {
        console.error(err);
    }

    return option;
}
