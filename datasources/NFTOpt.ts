import { ethers } from "ethers";
import addresses from "../addresses.json";
import { NFTOpt } from "../typechain-types/contracts/NFTOpt";
import NFTOptSolContract from "../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { network } from "./provider";

export let contracts =
{
    NFTOpt      : {} as unknown as NFTOpt
,   Collections : {}
};

export const clearNFTOpt = () =>
{
    if (contracts.NFTOpt.removeAllListeners) contracts.NFTOpt.removeAllListeners();
    contracts.NFTOpt = {} as unknown as NFTOpt;
}

export const createNFTOptInstance = (SignerOrProvider?: ethers.Signer | ethers.providers.Provider) =>
{
    // Create completely new instance with the default provider (readonly)
    contracts.NFTOpt = new ethers.Contract
    (
        addresses[network ?? -1].NFTOpt
    ,   NFTOptSolContract.abi
    ,   SignerOrProvider
    ) as NFTOpt;
}
