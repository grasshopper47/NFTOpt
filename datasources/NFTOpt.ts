import { ethers } from "ethers";
import addresses from "../addresses.json";
import { NFTOpt } from "../typechain-types/contracts/NFTOpt";
import NFTOptSolContract from "../artifacts/contracts/NFTOpt.sol/NFTOpt.json";

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

export const createNFTOptInstance = (network : string, signerOrProvider?: ethers.Signer | ethers.providers.Provider) =>
{
    // Create completely new instance with the default provider (readonly)
    contracts.NFTOpt = new ethers.Contract
    (
        addresses[network].NFTOpt
    ,   NFTOptSolContract.abi
    ,   signerOrProvider
    ) as NFTOpt;
}
