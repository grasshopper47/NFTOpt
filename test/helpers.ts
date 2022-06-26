// @ts-ignore
import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Option, OptionState, OptionFlavor } from "../src/models/option";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../src/utils/constants";
import { BigNumber } from "ethers";
import {
    NFTOptContract,
    deployMainContractLibraries,
    deployMainContract,
    deployNFTCollectionContract,
    contracts,
} from "../src/utils/deployment";
import { ERC721 } from "../typechain-types";

export let buyer: SignerWithAddress;
export let seller: SignerWithAddress;
export let nonParticipant: SignerWithAddress;

export let dummyOptionRequest: Option;
export let NFTDummyContract: ERC721;

export async function deployHardHatDummyNFTCollection()
{
    const name = "NK_NFT";
    await deployNFTCollectionContract(name);

    NFTDummyContract = contracts[name].instance;
    dummyOptionRequest.nftContract = NFTDummyContract.address;
}

export const initializer = async () =>
{
    [ buyer, seller, nonParticipant ] = await ethers.getSigners();

    dummyOptionRequest =
    {
        id          : -1            // not used
    ,   buyer       : buyer.address
    ,   seller      : ADDRESS0
    ,   nftContract : ""
    ,   nftId       : BigNumber.from(1)
    ,   startDate   : 0
    ,   interval    : 7 * SECONDS_IN_A_DAY
    ,   premium     : ethers.utils.parseEther("1")
    ,   strikePrice : ethers.utils.parseEther("50")
    ,   flavor      : OptionFlavor.EUROPEAN
    ,   state       : OptionState.PUBLISHED
    };

    await deployMainContractLibraries();
    await deployMainContract();
    await deployHardHatDummyNFTCollection();
};

export let publishDummyOptionRequest = async () =>
{
    await expect
    (
        NFTOptContract.connect(buyer).publishOptionRequest
        (
            dummyOptionRequest.nftContract
        ,   dummyOptionRequest.nftId
        ,   dummyOptionRequest.strikePrice
        ,   dummyOptionRequest.interval
        ,   dummyOptionRequest.flavor
        ,   { value: dummyOptionRequest.premium }
        )
    )
    .to.emit(NFTOptContract, "Published");
};

export async function addDaysToEVM(days: number)
{
    await ethers.provider.send("evm_increaseTime", [days * SECONDS_IN_A_DAY]);
    await ethers.provider.send("evm_mine", []);
}