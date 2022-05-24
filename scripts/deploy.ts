import {ethers} from "hardhat";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";

let buyer: SignerWithAddress;

async function setupAccounts() {
    const accounts = await ethers.getSigners();
    buyer = accounts[0];
}

async function deployContracts() {
    const NFTOptFactory = await ethers.getContractFactory("NFTOpt");
    const NFTOpt = await NFTOptFactory.deploy();
    await NFTOpt.deployed();

    console.log("Deployed NFTOpt address:", NFTOpt.address);

    // Deploy dummy NFT contract and mint 20 nfts
    const NFT = await ethers.getContractFactory("DummyNFT");
    let NFTDummyCTR = await NFT.deploy(buyer.address);
    await NFTDummyCTR.deployed();

    console.log("Deployed NFTDummy address:", NFTDummyCTR.address);

    // Sanity check minting
    let numMinted = (await NFTDummyCTR.balanceOf(buyer.address)).toString()
    console.log(`Minted ${numMinted} NFTs to adress ${buyer.address}!`);

    let metadata = await NFTDummyCTR.tokenURI(0)
    console.log(`Metadata for TokenID 0 is ${metadata}!`);
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