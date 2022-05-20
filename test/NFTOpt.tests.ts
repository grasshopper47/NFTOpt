import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("NFTOpt Tests", function () {
    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: Contract;

    interface Option
    {
        buyer: string
        seller: string
        nftContract: string
        nftId: number
        startDate: number
        interval: number
        premium: any
        strikePrice: any
        flavor: number
        state: number
    };

    let dummyOption : Option;

    beforeEach("deploy contract", async () => {
        const accounts = await ethers.getSigners();

        buyer  = accounts[0];
        seller = accounts[1];

        // Deploy APP contract
        const NFTOpt = await ethers.getContractFactory("NFTOpt");
        NFTOptCTR = await NFTOpt.deploy();
        await NFTOptCTR.deployed();
    });

    describe("createOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(
                NFTOptCTR.connect(buyer).createOptionRequest(buyer.address,0,0,0,0)
            ).to.not.throw;
        });
    });

    describe("cancelOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(
                NFTOptCTR.connect(buyer).cancelOptionRequest(0)
            ).to.not.throw;
        });
    });

    describe("createOption", function () {
        it("should test that method can be called", async function () {
            expect(
                NFTOptCTR.connect(buyer).createOption(0)
            ).to.not.throw;
        });
    });

    describe("cancelOption", function () {
        it("should test that method can be called", async function () {
            expect(
                NFTOptCTR.connect(buyer).cancelOption(0)
            ).to.not.throw;
        });
    });

    describe("exerciseOption", function () {
        it("should test that method can be called", async function () {
            expect(
                NFTOptCTR.connect(buyer).createOptionRequest(0)
            ).to.not.throw;
        });
    });
});
