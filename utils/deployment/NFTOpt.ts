import { NFTOpt } from "../../typechain-types";
import { ethers } from "hardhat";

export let NFTOptContract: NFTOpt;

let _interfaceDetectorAddress: string;

export async function deployNFTOptLibraries()
{
    const InterfaceDetectorFactory = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorContract = await InterfaceDetectorFactory.deploy();
    await InterfaceDetectorContract.deployed();

    _interfaceDetectorAddress = InterfaceDetectorContract.address;
}

export async function deployNFTOptContract()
{
    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", { libraries: { InterfaceDetector: _interfaceDetectorAddress } });
    NFTOptContract = await NFTOptFactory.deploy() as NFTOpt;
    await NFTOptContract.deployed();
}
