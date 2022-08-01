import { expect } from "chai";
import { ethers } from "hardhat";
import { SECONDS_IN_A_DAY } from "../../utils/constants";
import { NFTOptContract, deployNFTOptContract } from "../../utils/deployment/NFTOpt";
import {
    buyer,
    initializer,
    NFTDummyContract,
    dummyOptionRequest,
    publishDummyRequest,
} from "../helpers";

describe("publishRequest", function () {
    before("prepareEnv", async function () {
        await initializer();
    });

    it("reverts when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(buyer.address, 1, 0, 0, 0))
            .to.be.revertedWith("MISSING_IMPLEMENTATION");
    });

    it("reverts when called with 0 as NFT Token ID", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 0, 0, 0, 0))
            .to.be.revertedWith("INVALID_TOKEN_ID");
    });

    it("reverts when NFT Token ID is under different ownership than the caller's", async function () {
        let owner = await NFTDummyContract.ownerOf(9999);

        expect(owner).to.be.equal(NFTDummyContract.address);

        // Can't publish option request when not an owner
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 9999, 0, 0, 0))
            .to.be.revertedWith("NFT_NOT_OWNER");
    });

    it("reverts when called without a premium (transaction value)", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 0, 0, 0))
            .to.be.revertedWith("INVALID_PREMIUM_AMOUNT");
    });

    it("reverts when called with 0 as strike price", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 0, 0, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_STRIKE_PRICE_AMOUNT");
    });

    it("reverts when called with premium is equal to strike price", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 10, SECONDS_IN_A_DAY + 1, 0, { value: 10 }))
            .to.be.revertedWith("INVALID_PREMIUM_AMOUNT");
    });

    it("reverts when called with premium is greater than strike price", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 10, SECONDS_IN_A_DAY + 1, 0, { value: 11 }))
            .to.be.revertedWith("INVALID_PREMIUM_AMOUNT");
    });

    it("reverts when called with 0 as interval", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 10, 0, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_EXPIRATION_INTERVAL");
    });

    it("reverts when called with interval less than 1 day", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 10, SECONDS_IN_A_DAY - 1, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_EXPIRATION_INTERVAL");
    });

    it("reverts when called with interval over 30 days", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishRequest(NFTDummyContract.address, 1, 10, 30 * SECONDS_IN_A_DAY + 1, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_EXPIRATION_INTERVAL");
    });

    it("succeeds when called with valid values", async function () {
        const balance0 = await ethers.provider.getBalance(NFTOptContract.address);
        const requestID0 = await NFTOptContract.optionID();

        expect(balance0).to.equal(0);
        expect(requestID0).to.equal(0);

        await publishDummyRequest();

        const balance1 = await ethers.provider.getBalance(NFTOptContract.address);
        const requestID1 = await NFTOptContract.optionID();

        expect(balance1).to.equal(dummyOptionRequest.premium);
        expect(requestID1).to.equal(1);

        // Check that details of the option data match those sent
        const request = await NFTOptContract.options(0);

        expect(request.buyer).to.equal(dummyOptionRequest.buyer);
        expect(request.nftContract).to.equal(dummyOptionRequest.nftContract);
        expect(request.nftId).to.equal(dummyOptionRequest.nftId);
        expect(request.interval).to.equal(dummyOptionRequest.interval);
        expect(request.premium).to.equal(dummyOptionRequest.premium);
        expect(request.strikePrice).to.equal(dummyOptionRequest.strikePrice);
        expect(request.flavor).to.equal(dummyOptionRequest.flavor);

        // Reset the state
        await deployNFTOptContract();
    });

    it("emits 'Published' event when succeeded", async function () {
        await expect(
            NFTOptContract.connect(buyer).publishRequest(
                dummyOptionRequest.nftContract,
                dummyOptionRequest.nftId,
                dummyOptionRequest.strikePrice,
                dummyOptionRequest.interval,
                dummyOptionRequest.flavor,
                { value: 1 }
            )
        )
            .to.emit(NFTOptContract, "Published")
            .withArgs(0);

        // Reset the state
        await deployNFTOptContract();
    });

    it("prints gas limit", async function () {
        await publishDummyRequest();
        const currentGas = (
            await NFTOptContract.connect(buyer).estimateGas.publishRequest(
                dummyOptionRequest.nftContract,
                dummyOptionRequest.nftId,
                dummyOptionRequest.strikePrice,
                dummyOptionRequest.interval,
                dummyOptionRequest.flavor,
                { value: 1 }
            )
        ).toNumber();
        console.log(currentGas);
      });
});
