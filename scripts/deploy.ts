import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

let buyer: SignerWithAddress;

async function setupAccounts() {
    const accounts = await ethers.getSigners();
    buyer = accounts[0];
}

async function create_address_json(address_map: object) {
    const fs = require("fs");
    fs.writeFileSync("addresses.json", JSON.stringify({localhost: address_map}));
}

async function deployContracts() {
    const InterfaceDetector = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorCTR = await InterfaceDetector.deploy();
    await InterfaceDetectorCTR.deployed();

    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", {
        libraries: {
            InterfaceDetector: InterfaceDetectorCTR.address,
        },
    });
    const NFTOpt = await NFTOptFactory.deploy();
    await NFTOpt.deployed();

    console.log("\nDeployed NFTOpt address:", NFTOpt.address);

    // Deploy dummy NFT contract and mint 20 nfts
    const NFT = await ethers.getContractFactory("DummyNFT");
    let NFTDummyCTR = await NFT.deploy(buyer.address);
    await NFTDummyCTR.deployed();

    console.log("Deployed NFTDummy address:", NFTDummyCTR.address);

    // Sanity check minting
    let numMinted = (await NFTDummyCTR.balanceOf(buyer.address)).toString();
    console.log(`\nMinted ${numMinted} NFTs and set owner to '${buyer.address}'`);

    // Update local json addresses
    create_address_json({
        NFTOpt: NFTOpt.address,
        NFTDummy: NFTDummyCTR.address,
    });
}

async function deployLocalDevEnv() {
    // Fund testing account
    await setupAccounts();

    // Deploy main contracts
    await deployContracts();
}

deployLocalDevEnv()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
