import { NFTOpt } from "../typechain-types";

export let contracts = { NFTOpt: null as unknown as NFTOpt };

export const clearNFTOpt = () =>
{
    contracts.NFTOpt?.removeAllListeners();
    contracts = { NFTOpt: null as unknown as NFTOpt };
}
