import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let buyer: SignerWithAddress;

async function setupAccounts() {
    const accounts = await ethers.getSigners();
    buyer = accounts[0];
}

async function deployContracts() {
    const InterfaceDetector = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorCTR = await InterfaceDetector.deploy();
    await InterfaceDetectorCTR.deployed();

    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", {
        libraries: {
            "InterfaceDetector": InterfaceDetectorCTR.address,
        },
    });

    const NFTOptCTR = await NFTOptFactory.deploy();
    await NFTOptCTR.deployed();

    console.log("\nDeployed NFTOpt address:", NFTOptCTR.address);

    // Deploy dummy NFT contract and mint 20 nfts
    const NFTDummyFactory = await ethers.getContractFactory("DummyNFT");
    let NFTDummyCTR = await NFTDummyFactory.deploy(buyer.address);
    await NFTDummyCTR.deployed();
    console.log("Deployed NFTDummy address:", NFTDummyCTR.address);

    // Sanity check minting
    let numMinted = (await NFTDummyCTR.balanceOf(buyer.address)).toString()
    console.log(`\nMinted ${numMinted} NFTs and set owner to '${buyer.address}'`);
}

async function deployLocalDevEnv() {
    // Fund testing account
    await setupAccounts()

    // Deploy main contracts
    await deployContracts()
}

deployLocalDevEnv()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });