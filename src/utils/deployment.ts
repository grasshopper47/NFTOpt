// @ts-ignore
import { NFTOpt } from "../../typechain-types";
import { ethers } from "hardhat";
import fs from 'fs';

export let NFTOptContract: NFTOpt;
export const contracts : any = { };

// Populate contracts with files from local folder
const filesNames = fs.readdirSync('./contracts/NFT Collections')

for (const name of filesNames) contracts[name.slice(0, -4)] = { };
delete contracts["_BASE"];

let _interfaceDetectorAddress: string;

export async function deployMainContractLibraries()
{
    const InterfaceDetectorFactory = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorContract = await InterfaceDetectorFactory.deploy();
    await InterfaceDetectorContract.deployed();

    _interfaceDetectorAddress = InterfaceDetectorContract.address;
}

export async function deployMainContract()
{
    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", { libraries: { InterfaceDetector: _interfaceDetectorAddress } });
    NFTOptContract = await NFTOptFactory.deploy() as NFTOpt;
    await NFTOptContract.deployed();
}

export async function deployNFTCollectionContract(name: string)
{
    const accounts = await ethers.getSigners();

    const NFTCollectionFactory = await ethers.getContractFactory(name);
    let NFTCollectionContract = await NFTCollectionFactory.deploy();
    await NFTCollectionContract.deployed();

    contracts[name].instance = NFTCollectionContract;

    const max = 5;// await NFTCollectionContract.MAX_MINTABLE_TOKENS();

    for (let i = 0; i !== max; ++i) { await NFTCollectionContract.connect(accounts[0]).mint(); }
}