import { ethers } from "hardhat";
import fs from 'fs';

export const NFTCollectionContracts : any = { };

// Populate NFTCollectionContracts with files from local folder
const filesNames = fs.readdirSync("contracts/NFT Collections");

for (const name of filesNames) NFTCollectionContracts[name.slice(0, -4)] = { };
delete NFTCollectionContracts["_BASE"];

export async function deployNFTCollectionContract(name: string)
{
    const accounts = await ethers.getSigners();

    const NFTCollectionFactory = await ethers.getContractFactory(name);
    let NFTCollectionContract = await NFTCollectionFactory.deploy();
    await NFTCollectionContract.deployed();

    NFTCollectionContracts[name].instance = NFTCollectionContract;
}
