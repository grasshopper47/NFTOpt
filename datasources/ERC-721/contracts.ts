import { ethers } from "ethers";
import { provider } from "../provider";
import { ABIs } from "../../utils/constants";
import { ERC721 } from "../../typechain-types";

let NFTContractsCache : any = {};
export const clearContractsCache = () => NFTContractsCache = {};

export const addContractToCache = (address : string, contract : any) => NFTContractsCache[address] = contract;

export const getCachedContract = (address : string, extraABIs : any[] = []) : ERC721 =>
{
    let contract = NFTContractsCache[address];

    if (contract) return contract;

    const ABI =
    [
        ABIs.ERC721.name
    ,   ABIs.ERC721.ownerOf
    ,   ABIs.ERC721.tokenURI
    ,   ABIs.ERC721.getApproved
    ,   ABIs.ERC721.approve
    // ,   ABIs.ERC721.transferFrom
    ,   ABIs.ERC721.Events.Approval
    ,   ABIs.ERC721.Events.Transfer
    ];

    for (const abi of extraABIs) ABI.push(abi);

    contract = new ethers.Contract(address, ABI, provider);

    NFTContractsCache[address] = contract;

    return contract;
}
