// @ts-ignore
import { ethers } from "hardhat";
import { NFTOpt } from "../../typechain-types";

export const contracts : any =
{
    NK_NFT: {}
,   TH_NFT: {}
,   EH_NFT: {}
};

let InterfaceDetectorAddress: string;
export let NFTOptContract: NFTOpt;

export async function deployMainContractLibraries()
{
    const InterfaceDetectorFactory = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorContract = await InterfaceDetectorFactory.deploy();
    await InterfaceDetectorContract.deployed();

    InterfaceDetectorAddress = InterfaceDetectorContract.address;
}

export async function deployMainContract()
{
    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", { libraries: { InterfaceDetector: InterfaceDetectorAddress } });
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

    const max = await NFTCollectionContract.MAX_MINTABLE_TOKENS();

    for (let i = 0; i !== max; ++i) { await NFTCollectionContract.connect(accounts[0]).mint(); }
}