import { BigNumber, ethers } from "ethers";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { Option } from "./types";
import { addressEmpty, SECONDS_IN_A_DAY } from "./constants";

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

export async function loadContractOptions(contract: NFTOpt, setOptionsCallback: (options: Option[]) => void) {
    let options: Option[] = [];

    let optionIDPromise = null;
    try {
        optionIDPromise = await contract.optionID();
    }
    catch (err) {
        console.error(err);
        return
    }

    if (!optionIDPromise) { return; }

    // TODO: handle optionsLength > 2^53
    const optionsLength = optionIDPromise.toNumber();

    for (let idx = 1; idx !== optionsLength; ++idx) {
        const contractOption = await contract.options(idx);

        if (!isOptionValid(contractOption)) { continue; }

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

    setOptionsCallback(options);
}