import { ethers } from "ethers";
import { ABIs } from "../../utils/constants";
import { provider } from "../../src/utils/metamask";

let NFTContractsCache = {};
export const clearContractsCache = () => NFTContractsCache = {};

export const addContractToCache = (address : string, contract : any) => NFTContractsCache[address] = contract;

export function getCachedContract(address : string)
{
    let contract = NFTContractsCache[address];

    if (contract) return contract;

    contract =
    new ethers.Contract
    (
        address
    ,   [
            ABIs.ERC721.name
        ,   ABIs.ERC721.ownerOf
        ,   ABIs.ERC721.tokenURI
        ,   ABIs.ERC721.getApproved
        ,   ABIs.ERC721.approve
        ,   ABIs.ERC721.Events.Approval
        ,   ABIs.ERC721.Events.Transfer
        ]
    ,   provider()
    );

    NFTContractsCache[address] = contract;

    return contract;
}
