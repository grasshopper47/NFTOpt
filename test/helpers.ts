// @ts-ignore
import { Collection_BASE, Collection_BASE } from "../typechain-types";

import { ethers } from "hardhat";
import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Option } from "../models/option";
import { OptionFlavor } from "../models/enums";
import { BIGNUMBER0, SECONDS_IN_A_DAY } from "../utils/constants";
import { BigNumber } from "ethers";
import { NFTOptContract, deployNFTOptLibraries, deployNFTOptContract } from "../utils/deployment/NFTOpt";
import { deployNFTCollectionContract, NFTCollectionContracts } from "../utils/deployment/NFTCollections";

export let buyer      : SignerWithAddress;
export let seller     : SignerWithAddress;
export let thirdParty : SignerWithAddress;

export let dummyOptionRequest : Option;
export let NFTDummyContract : Collection_BASE;

export const initializer = async () =>
{
    [ buyer, seller, thirdParty ] = await ethers.getSigners();

    dummyOptionRequest =
    {
        buyer       : buyer.address
    ,   nftContract : ""
    ,   nftId       : BigNumber.from(1)
    ,   startDate   : BIGNUMBER0
    ,   interval    : 7 * SECONDS_IN_A_DAY
    ,   premium     : ethers.utils.parseEther("1")
    ,   strikePrice : ethers.utils.parseEther("50")
    ,   flavor      : OptionFlavor.EUROPEAN
    } as Option;

    await deployNFTOptLibraries();
    await deployNFTOptContract();

    const name = "NK_NFT";
    await deployNFTCollectionContract(name);

    NFTDummyContract = NFTCollectionContracts[name].instance;
    dummyOptionRequest.nftContract = NFTDummyContract.address;

    await NFTDummyContract.connect(buyer).mint();
};

export let publishDummyRequest = async () =>
{
    await expect
    (
        NFTOptContract.connect(buyer).publishRequest
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
