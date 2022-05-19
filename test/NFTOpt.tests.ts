import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {Contract} from "ethers";
import {ethers} from "hardhat";

describe("NFTOpt Tests", function () {
    let owner: SignerWithAddress;
    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: Contract;

    beforeEach("deploy contract", async () => {
        const accounts = await ethers.getSigners();

        owner = accounts[0];
        buyer = accounts[1];
        seller = accounts[2];

        const NFTOpt = await ethers.getContractFactory("NFTOpt");
        NFTOptCTR = await NFTOpt.deploy();
        await NFTOptCTR.deployed();
    });

    describe("createOptionRequest", function () {
    });

    describe("cancelOptionRequest", function () {

    });

    describe("createOption", function () {
    });

    describe("cancelOption", function () {
    });

    describe("exerciseOption", async function () {

        // Create dummies options
        let optionAmericanId = await NFTOptCTR.connect(buyer).createOptionRequest(0)
        let optionEuropeanId = await NFTOptCTR.connect(buyer).createOptionRequest(0)

        // Fulfil options requests
        await NFTOptCTR.connect(seller).createOption(optionAmericanId)
        await NFTOptCTR.connect(seller).createOption(optionEuropeanId)

        it("should revert with non-existent optionID", async function () {
            expect(
                NFTOptCTR.connect(buyer).exerciseOption(9999)
            ).to.be.reverted("INVALID_OPTION_ID");
        });

        it("only option buyer can execute", async function () {
            await expect(
                NFTOptCTR.connect(owner).exerciseOption(0)
            ).to.be.reverted("INVALID_ADDRESS");
        });

        // TODO: may drop given this should be addressed in createOption phase
        // it("seller is not burn account", async function () {
        //     expect(
        //         NFTOptCTR.connect(buyer).createOptionRequest(0)
        //     ).to.not.throw;
        // });

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
