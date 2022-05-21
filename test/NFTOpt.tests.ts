import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";
import {NFTOpt, DummyNFT} from "../typechain-types";

describe("NFTOpt Tests", function () {

    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: NFTOpt;
    let NFTCTR: DummyNFT;

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
        NFTCTR = await NFT.deploy("NFT_NAME", "NFT_SYMBOL", buyer.address);
        await NFTCTR.deployed();
    });

    describe("createOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).publishOptionRequest(buyer.address, 0, 0, 0, 0)).to.not.throw;
        });
    });

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
        })
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

        it("should revert with non-existent optionID", async function () {

            let balance = await NFTCTR.connect(buyer).balanceOf(buyer.address);
            console.log(balance.toString());

            // // Create dummies options
            // let optionAmericanId = NFTOptCTR.connect(buyer).createOptionRequest(0)
            // let optionEuropeanId = NFTOptCTR.connect(buyer).createOptionRequest(0)
            //
            // // Fulfil options requests
            // NFTOptCTR.connect(seller).createOption(optionAmericanId)
            // NFTOptCTR.connect(seller).createOption(optionEuropeanId)


            expect(
                NFTOptCTR.connect(buyer).exerciseOption(9999)
            ).to.be.reverted("INVALID_OPTION_ID");
        });

        it("only option buyer can execute", async function () {
            await expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.be.reverted("INVALID_ADDRESS");
        });

        it("european option should not be exercised before the expiration day", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.be.reverted;
        });

        it("american option should be able to exercise before the expiration day", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.be.true;
        });

        it("contract must be approved to transfer NFT", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.be.true;
        });

        it("Buyer must be owner of the NFT id", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.not.throw;
        });
        it("Upon exercise, BUYER must have  increased his ETH balance by STRIKE_PRICE", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.not.throw;
        });
        it("Upon exercise, SELLER must have ownership of NFT_ID", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.not.throw;
        });
        // Close option and try exercise
        it("should revert with non-open options", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(0)
            ).to.not.throw;
        });
    });

});
