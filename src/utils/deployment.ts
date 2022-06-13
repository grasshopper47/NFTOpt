import { ethers } from "hardhat";
import { NFTOpt } from "../../typechain-types";

export const contracts: any = {
    NK_NFT: {},
    TH_NFT: {},
    EH_NFT: {},
};

export let InterfaceDetectorAddress: string;
export let NFTOptContract: NFTOpt;

export async function deployMainContractLibraries() {
    const InterfaceDetectorFactory = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorContract = await InterfaceDetectorFactory.deploy();
    await InterfaceDetectorContract.deployed();
    InterfaceDetectorAddress = InterfaceDetectorContract.address;
}

export async function deployMainContract() {
    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", {
        libraries: {
            InterfaceDetector: InterfaceDetectorAddress,
        },
    });

    //@ts-ignore
    NFTOptContract = await NFTOptFactory.deploy();
    await NFTOptContract.deployed();
}

export async function deployNFTCollectionContract(name: string, cb?: { (r: any): any }) {
    const accounts = await ethers.getSigners();

    const NFTCollectionFactory = await ethers.getContractFactory(name);
    //@ts-ignore
    let NFTCollectionContract = await NFTCollectionFactory.deploy();
    await NFTCollectionContract.deployed();

    console.log(`Deployed ${name} @ ${NFTCollectionContract.address}`);
    contracts[name].instance = NFTCollectionContract;

    const max = await NFTCollectionContract.MAX_MINTABLE_TOKENS();

    for (let i = 0; i < max; ++i) { await NFTCollectionContract.connect(accounts[0]).mint(); }

    console.log(`Minted NFTs for ${name}`);
}

export async function deployLocalDevEnv() {
    // Construct a JSON to write to disk after deployment
    let addressesJSON: Record<string, any> = {};

    await deployMainContractLibraries();
    await deployMainContract();

    addressesJSON["NFTOpt"] = NFTOptContract.address;

    console.log("\nDeployed NFTOpt address:", NFTOptContract.address);

    for (const name of Object.keys(contracts))
    {
        await deployNFTCollectionContract(name);

        addressesJSON[name] = contracts[name].instance.address;
    }

    // Update addresses.json file with published contract addresses
    const fs = require("fs");
    await fs.writeFileSync("addresses.json", JSON.stringify({ localhost: addressesJSON }));
}
