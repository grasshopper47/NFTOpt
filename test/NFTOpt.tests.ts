import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { NFTOpt, DummyNFT } from "../typechain-types";

describe("NFTOpt Tests", function () {

    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: NFTOpt;
    let NFTDummyCTR: DummyNFT;

    interface Option {
        buyer: string;
        seller: string;
        nftContract: string;
        nftId: number;
        startDate: number;
        interval: number;
        premium: any;
        strikePrice: any;
        flavor: number;
        state: number;
    }

    let dummyOption: Option;

    beforeEach("deploy contract", async () => {
        const accounts = await ethers.getSigners();

        buyer = accounts[0];
        seller = accounts[1];

        // Deploy APP contract
        const NFTOpt = await ethers.getContractFactory("NFTOpt");
        NFTOptCTR = await NFTOpt.deploy();
        await NFTOptCTR.deployed();

        // Deploy dummy NFT contract and mint 20 nfts to buyer
        const NFT = await ethers.getContractFactory("DummyNFT");
        NFTDummyCTR = await NFT.deploy("NFT_NAME","NFT_SYMBOL", buyer.address);
        await NFTDummyCTR.deployed();

        dummyOption =
        {
            buyer       : buyer.address
        ,   seller      : "0x0000000000000000000000000000000000000000"
        ,   nftContract : NFTDummyCTR.address
        ,   nftId       : 101
        ,   startDate   : 0
        ,   interval    : 7
        ,   premium     : ethers.BigNumber.from(1)
        ,   strikePrice : ethers.BigNumber.from(50)
        ,   flavor      : 0
        ,   state       : 0
        }
    });

    describe("publishOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).publishOptionRequest(buyer.address,0,0,0,0,0)).to.not.throw;
        });

        it("should fail when called with address(0) as NFT Contract", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest("0x0000000000000000000000000000000000000000",0,0,0,0,0)
            ).to.be.revertedWith("NFT token contract must be a valid address");
        });

        it("should fail when called with 0 as NFT token id", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,0,0,0,0,0)
            ).to.be.revertedWith("NFT token ID must be > 0");
        });

        it("should fail when called with 0 as premium", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,1,0,0,0,0)
            ).to.be.revertedWith("Premium must be > 0");
        });

        it("should fail when caller is missing required funds for premium", async function () {
            let balance = (await buyer.getBalance()).add(1);
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address, 1, balance, 0,0,0)
            ).to.be.revertedWith("Caller is missing required funds to supply premium amount");
        });

        it("should fail when called with 0 as strike price", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,1,1,0,0,0)
            ).to.be.revertedWith("Strike price must be > 0");
        });

        it("should fail when called with 0 as interval", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,1,1,1,0,0)
            ).to.be.revertedWith("Expiration interval must be > 0");
        });

        it("should succeed when called with valid values", async function () {

            let balance_ctr = (await NFTOptCTR.getBalance());
            let balance = (await buyer.getBalance());

            expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest
                         (
                             dummyOption.nftContract
                         ,   dummyOption.nftId
                         ,   dummyOption.premium
                         ,   dummyOption.strikePrice
                         ,   dummyOption.interval
                         ,   dummyOption.flavor
                         )
            ).to.not.be.reverted;

            let balance2_ctr = (await NFTOptCTR.getBalance());
            let balance2 = (await buyer.getBalance());

            console.log(balance);
            console.log(balance2);
            console.log(balance_ctr);
            console.log(balance2_ctr);

            expect( await NFTOptCTR.optionID() ).to.equal(1);

            // expect(balance2.eq(balance.sub(dummyOption.premium))).to.equal(1);
            // expect(balance2_ctr.eq(balance2_ctr.add(dummyOption.premium))).to.equal(1);

            let option = await NFTOptCTR.options(1);

            expect(option.buyer).to.equal(dummyOption.buyer);
            expect(option.seller).to.equal(dummyOption.seller);
            expect(option.nftContract).to.equal(dummyOption.nftContract);
            expect(option.nftId).to.equal(dummyOption.nftId);
            expect(option.startDate).to.equal(dummyOption.startDate);
            expect(option.interval).to.equal(dummyOption.interval);
            expect(option.premium).to.equal(dummyOption.premium);
            expect(option.strikePrice).to.equal(dummyOption.strikePrice);
            expect(option.flavor).to.equal(dummyOption.flavor);
            expect(option.state).to.equal(dummyOption.state);
        });
     });

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
        });
    });

    describe("createOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).createOption(0)).to.not.throw;
        });
    });

    describe("cancelOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).cancelOption(0)).to.not.throw;
        });
    });

    describe("exerciseOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).exerciseOption(0)).to.not.throw;
        });
    });
});
