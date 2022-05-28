import {expect} from "chai";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {NFTOpt, DummyNFT} from "../../typechain-types";
import {ethers} from "hardhat";
import {Option_TEST_STRUCT, OptionState, OptionFlavor} from "./types";
import {addressEmpty, SECONDS_IN_A_DAY} from "./constants";

export let buyer: SignerWithAddress;
export let seller: SignerWithAddress;
export let nonParticipant: SignerWithAddress;
export let InterfaceDetectorAddress: string;
export let NFTOptCTR: NFTOpt;
export let NFTDummyCTR: DummyNFT;

export let dummyOptionRequest: Option_TEST_STRUCT;

export let publishDummyOptionRequest = async () => {
    await expect(
        NFTOptCTR.connect(buyer).publishOptionRequest(
            dummyOptionRequest.nftContract,
            dummyOptionRequest.nftId,
            dummyOptionRequest.strikePrice,
            dummyOptionRequest.interval,
            dummyOptionRequest.flavor,
            {value: dummyOptionRequest.premium}
        )
    ).to.emit(NFTOptCTR, "NewRequest");
};

export async function increaseEVMTimestampBy(days: number) {
    const numberOfDays = days * SECONDS_IN_A_DAY;

    await ethers.provider.send("evm_increaseTime", [numberOfDays]);

    await ethers.provider.send("evm_mine", []);
}

export async function deployNFTOptContract() {
    const NFTOpt = await ethers.getContractFactory("NFTOpt", {
        libraries: {
            InterfaceDetector: InterfaceDetectorAddress,
        },
    });

    // @ts-ignore
    NFTOptCTR = await NFTOpt.deploy();
    await NFTOptCTR.deployed();
}

export async function deployNFTDummyContract() {
    // Deploy dummy NFT contract and mint 20 nfts to buyer
    const NFT = await ethers.getContractFactory("DummyNFT");
    // @ts-ignore
    NFTDummyCTR = await NFT.deploy(buyer.address);
    await NFTDummyCTR.deployed();

    dummyOptionRequest.nftContract = NFTDummyCTR.address;
    dummyOptionRequest.nftId = 10;
}

export const initializer = async () => {
    const accounts = await ethers.getSigners();

    buyer = accounts[0];
    seller = accounts[1];

    nonParticipant = accounts[3];

    dummyOptionRequest = {
        buyer: buyer.address,
        seller: addressEmpty,
        nftContract: "",
        nftId: 0,
        startDate: 0,
        interval: 7 * SECONDS_IN_A_DAY,
        premium: ethers.utils.parseEther("1"),
        strikePrice: ethers.utils.parseEther("50"),
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.REQUEST,
    };

    const InterfaceDetector = await ethers.getContractFactory("InterfaceDetector");
    let InterfaceDetectorCTR = await InterfaceDetector.deploy();
    await InterfaceDetectorCTR.deployed();
    InterfaceDetectorAddress = InterfaceDetectorCTR.address;

    await deployNFTOptContract();
    await deployNFTDummyContract();
};
