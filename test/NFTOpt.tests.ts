import {Contract} from "ethers";
import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {ethers} from "hardhat";

describe("NFTOpt Tests", function () {
    let owner: SignerWithAddress;
    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: Contract;
    let NFTCTR: Contract;

    beforeEach("deploy contract", async () => {
        const accounts = await ethers.getSigners();

        owner = accounts[0];
        buyer = accounts[1];
        seller = accounts[2];

        const NFTOpt = await ethers.getContractFactory("NFTOpt");
        NFTOptCTR = await NFTOpt.deploy();
        await NFTOptCTR.deployed();

        // Deploy dummy NFT contract
        const NFT = await ethers.getContractFactory("DummyNFT");
        NFTCTR = await NFT.deploy("Foo", 'BAR', buyer.address);
        await NFTCTR.deployed();
        console.log(await NFTCTR.balanceOf(buyer.address).toNumber);
    });

    // describe("add", function () {
    //
    //     it("should revert when invalid animal is provided", async function () {
    //         await expect(
    //             NFTCTR.connect(owner).add("", 5)
    //         ).to.be.revertedWith("Invalid animal");
    //     });
    //
    // });
    //
    // describe("createOptionRequest", function () {
    // });
    //
    // describe("cancelOptionRequest", function () {
    //
    // });
    //
    // describe("createOption", function () {
    // });
    //
    // describe("cancelOption", function () {
    // });
    //
    describe("exerciseOption", function () {

        it("should revert with non-existent optionID", async function () {

            let  balance = await NFTCTR.connect(buyer).balanceOf(buyer.address);
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
