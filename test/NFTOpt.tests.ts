import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("NFTOpt Tests", function () {
    let owner: SignerWithAddress;
    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: Contract;

    beforeEach("deploy contract", async () => {
        const accounts = await ethers.getSigners();

        owner  = accounts[0];
        buyer  = accounts[1];
        seller = accounts[2];

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

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(
                NFTOptCTR.connect(buyer).withdrawOptionRequest(0)
            ).to.not.throw;
        });

        it("should fail when caller is not the buyer", async function () {
            expect(
                NFTOptCTR.connect(seller).withdrawOptionRequest(0)
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
