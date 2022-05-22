import { ethers } from "hardhat";

async function main() {
    const NFTOptFactory = await ethers.getContractFactory("NFTOpt");
    const NFTOpt = await NFTOptFactory.deploy();
    await NFTOpt.deployed();

    console.log("NFTOpt address:", NFTOpt.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });