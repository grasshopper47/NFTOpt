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

export const createNFTOptInstance = (provider: ethers.providers.Web3Provider, network : string) =>
{
    // Create completely new instance with the default provider (readonly)
    return new ethers.Contract
    (
        addresses[network].NFTOpt
    ,   NFTOptSolContract.abi
    ,   provider
    ) as NFTOpt;
}
