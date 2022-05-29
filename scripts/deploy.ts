import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

let buyer: SignerWithAddress;

async function deployContracts() {
    const InterfaceDetector = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorCTR = await InterfaceDetector.deploy();
    await InterfaceDetectorCTR.deployed();

    const NFTOptFactory = await ethers.getContractFactory("NFTOpt", {
        libraries: {
            InterfaceDetector: InterfaceDetectorCTR.address,
        },
    });

    const NFTOptCTR = await NFTOptFactory.deploy();
    await NFTOptCTR.deployed();

    console.log("\nDeployed NFTOpt address:", NFTOptCTR.address);

    // Construct a JSON to write to disk after deployment
    let addressesJSON: Record<string, any> = {};
    addressesJSON["NFTOpt"] = NFTOptCTR.address;

    const contractNames = [
        "NK_NFT",
        "TH_NFT",
        "EH_NFT"
    ];

    // Deploy each specified collection
    for (const name of contractNames) {
        const NFTFactory = await ethers.getContractFactory(name);
        let NFTContract = await NFTFactory.deploy(buyer.address);
        await NFTContract.deployed();

        console.log(`Deployed ${name} @ address:`, NFTContract.address);

        // Store address
        addressesJSON[name] = NFTContract.address;

        // Sanity check minting
        let numMinted = (await NFTContract.balanceOf(buyer.address)).toString();
        console.log(`-> Minted ${numMinted} NFTs and set owner to '${buyer.address}'\n`);
    }

    // Update addresses.json file with published contract addresses
    const fs = require("fs");
    await fs.writeFileSync("addresses.json", JSON.stringify({ localhost: addressesJSON }));
}

async function deployLocalDevEnv() {
    const accounts = await ethers.getSigners();
    buyer = accounts[0];

    await deployContracts();
}

deployLocalDevEnv()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });