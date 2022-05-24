import { expect } from "chai";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { NFTOpt, DummyNFT } from "../typechain-types";
import { ethers } from "hardhat";

export const address_empty: string = "0x0000000000000000000000000000000000000000";

export let buyer: SignerWithAddress;
export let seller: SignerWithAddress;
export let NFTOptCTR: NFTOpt;
export let NFTDummyCTR: DummyNFT;

export interface Option {
    buyer: string;
    seller: string;
    nftContract: string;
    nftId: number;
    startDate: number;
    interval: number;
    premium: BigNumber;
    strikePrice: BigNumber;
    flavor: number;
    state: number;
}

export const OptionState = {
    Request: 0,
    Open: 1,
    Closed: 2,
};

export const OptionFlavor = {
    European: 0,
    American: 1,
};

export let dummyOptionRequest: Option;

export let publishDummyOptionRequest = async () => {
    await expect(NFTOptCTR.connect(buyer)
        .publishOptionRequest(
            dummyOptionRequest.nftContract,
            dummyOptionRequest.nftId,
            dummyOptionRequest.strikePrice,
            dummyOptionRequest.interval,
            dummyOptionRequest.flavor,
            { value: dummyOptionRequest.premium }
        ))
        .to.emit(NFTOptCTR, "NewRequest");
};

export async function increaseEVMTimestampBy(days: number) {
    const numberOfDays = days * 24 * 3600;

    await ethers.provider.send("evm_increaseTime", [numberOfDays]);

    await ethers.provider.send("evm_mine", []);
}

export const contractInitializer = async () => {
    const accounts = await ethers.getSigners();

    buyer = accounts[0];
    seller = accounts[1];

    // Deploy APP contract
    const NFTOpt = await ethers.getContractFactory("NFTOpt");
    // @ts-ignore
    NFTOptCTR = await NFTOpt.deploy();
    await NFTOptCTR.deployed();

    // Deploy dummy NFT contract and mint 20 nfts to buyer
    const NFT = await ethers.getContractFactory("DummyNFT");
    // @ts-ignore
    NFTDummyCTR = await NFT.deploy(buyer.address);
    await NFTDummyCTR.deployed();

    dummyOptionRequest = {
        buyer: buyer.address,
        seller: address_empty,
        nftContract: NFTDummyCTR.address,
        nftId: 10,
        startDate: 0,
        interval: 7 * 24 * 3600, //  7 days
        premium: ethers.utils.parseEther("1"),
        strikePrice: ethers.utils.parseEther("50"),
        flavor: OptionFlavor.European,
        state: OptionState.Request,
    };
};
