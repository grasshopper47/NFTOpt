import {BigNumber} from "ethers";
import {NFTOpt} from "../../typechain-types/contracts/NFTOpt";
import {Option, OptionWithNFTDetails} from "./types";
import {addressEmpty, SECONDS_IN_A_DAY} from "./constants";
import {fetchNFTImage} from "./NFT/localhost";

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

        if (!optionIDPromise) {
            return;
        }

        // TODO: handle optionsLength > 2^53
        const optionsLength = optionIDPromise.toNumber();

        for (let idx = 1; idx <= optionsLength; ++idx) {
            const contractOption = await contract.options(idx);

            if (!isOptionValid(contractOption)) {
                continue;
            }

            options.push({
                id: idx,
                buyer: contractOption.buyer.toLowerCase(),
                seller: contractOption.seller.toLowerCase(),
                flavor: contractOption.flavor,
                interval: contractOption.interval / SECONDS_IN_A_DAY,
                nftContract: contractOption.nftContract,
                nftId: contractOption.nftId,
                premium: contractOption.premium,
                startDate: contractOption.startDate.toNumber(),
                state: contractOption.state,
                strikePrice: contractOption.strikePrice,
            });
        }
    } catch (err) {
        console.error(err);
    }

    return options;
}

export async function loadContractOptionWithNFTDetails(
    contract: NFTOpt,
    optionId: number
): Promise<OptionWithNFTDetails> {
    let option: OptionWithNFTDetails = null;

    try {
        const contractOption = await contract.options(optionId);

        if (!isOptionValid(contractOption)) {
            return;
        }

        option = {
            id: optionId,
            buyer: contractOption.buyer.toLowerCase(),
            seller: contractOption.seller.toLowerCase(),
            flavor: contractOption.flavor,
            interval: contractOption.interval / SECONDS_IN_A_DAY,
            premium: contractOption.premium,
            startDate: contractOption.startDate.toNumber(),
            state: contractOption.state,
            strikePrice: contractOption.strikePrice,
            asset: {
                tokenId: contractOption.nftId,
                address: contractOption.nftContract,
                name: "X Collection - " + contractOption.nftId.toNumber(),
                image: await fetchNFTImage(contractOption.nftContract, contractOption.nftId),
                url: "",
            },
        };
    } catch (err) {
        console.error(err);
    }

    return option;
}
