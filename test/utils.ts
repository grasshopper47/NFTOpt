import {expect} from "chai";
import {BigNumber} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {NFTOpt, DummyNFT} from "../typechain-types";
import {ethers} from "hardhat";

export const address0: string = "0x0000000000000000000000000000000000000000";

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
    return expect(
        NFTOptCTR.connect(buyer).publishOptionRequest(
            dummyOptionRequest.nftContract,
            dummyOptionRequest.nftId,
            dummyOptionRequest.strikePrice,
            dummyOptionRequest.interval,
            dummyOptionRequest.flavor,
            {value: dummyOptionRequest.premium}
        )
    ).to.not.be.reverted;
};

export async function increaseEVMTimestampBy(days: number) {
    const numberOfDays = days * 24 * 60 * 60;

    // @ts-ignore
    await ethers.provider.send("evm_increaseTime", [numberOfDays]);

    // @ts-ignore
    await ethers.provider.send("evm_mine");
}

export const contractInitializer = async () => {
    const accounts = await ethers.getSigners();

    buyer = accounts[0];
    seller = accounts[1];

    // Deploy APP contract
    const NFTOpt = await ethers.getContractFactory("NFTOpt");
    NFTOptCTR = await NFTOpt.deploy();
    await NFTOptCTR.deployed();

    // Deploy dummy NFT contract and mint 20 nfts to buyer
    const NFT = await ethers.getContractFactory("DummyNFT");
    NFTDummyCTR = await NFT.deploy(buyer.address);
    await NFTDummyCTR.deployed();

    dummyOptionRequest = {
        buyer: buyer.address,
        seller: address0,
        nftContract: NFTDummyCTR.address,
        nftId: 10,
        startDate: 0,
        interval: 7 * 24 * 60 * 60, //  7 days
        premium: ethers.utils.parseEther("1"),
        strikePrice: ethers.utils.parseEther("50"),
        flavor: OptionFlavor.European,
        state: OptionState.Request,
    };
};
