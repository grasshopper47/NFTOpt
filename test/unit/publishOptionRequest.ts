import { expect } from "chai";
import { NFTOptContract, deployMainContract } from "../../src/utils/deployment";
import {
    buyer,
    initializer,
    NFTDummyContract,
    dummyOptionRequest,
    publishDummyOptionRequest,
} from "../helpers";

describe("publishOptionRequest", function () {
    before("prepareEnv", async function () {
        await initializer();
    });

    it("reverts when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishOptionRequest(buyer.address, 1, 0, 0, 0))
            .to.be.revertedWith("NOT_AN_INTERFACE_OF");
    });

    it("reverts when called with 0 as NFT Token ID", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishOptionRequest(NFTDummyContract.address, 0, 0, 0, 0))
            .to.be.revertedWith("INVALID_TOKEN_ID");
    });

    it("reverts when NFT Token ID is under different ownership than the caller's", async function () {
        let owner = await NFTDummyContract.ownerOf(9999);

        expect(owner).to.be.equal(NFTDummyContract.address);

        // Can't publish option request when not an owner
        await expect(NFTOptContract.connect(buyer)
            .publishOptionRequest(NFTDummyContract.address, 9999, 0, 0, 0))
            .to.be.revertedWith("NFT_NOT_OWNER");
    });

    it("reverts when called without a premium (transaction value)", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishOptionRequest(NFTDummyContract.address, 1, 0, 0, 0))
            .to.be.revertedWith("INVALID_PREMIUM_AMOUNT");
    });

    it("reverts when called with 0 as Strike Price", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishOptionRequest(NFTDummyContract.address, 1, 0, 0, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_STRIKE_PRICE_AMOUNT");
    });

    it("reverts when called with 0 as Interval", async function () {
        await expect(NFTOptContract.connect(buyer)
            .publishOptionRequest(NFTDummyContract.address, 1, 1, 0, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_EXPIRATION_INTERVAL");
    });

    it("succeeds when called with valid values", async function () {
        const balance0 = await NFTOptContract.getBalance();
        const requestID0 = await NFTOptContract.requestID();

        expect(balance0).to.equal(0);
        expect(requestID0).to.equal(0);

        await publishDummyOptionRequest();

        const balance1 = await NFTOptContract.getBalance();
        const requestID1 = await NFTOptContract.requestID();

        expect(balance1).to.equal(dummyOptionRequest.premium);
        expect(requestID1).to.equal(1);

        // Check that details of the option data match those sent
        const request = await NFTOptContract.requests(0);

        expect(request.buyer).to.equal(dummyOptionRequest.buyer);
        expect(request.nftContract).to.equal(dummyOptionRequest.nftContract);
        expect(request.nftId).to.equal(dummyOptionRequest.nftId);
        expect(request.interval).to.equal(dummyOptionRequest.interval);
        expect(request.premium).to.equal(dummyOptionRequest.premium);
        expect(request.strikePrice).to.equal(dummyOptionRequest.strikePrice);
        expect(request.flavor).to.equal(dummyOptionRequest.flavor);

        // Reset the state
        await deployMainContract();
    });

    it("emits 'Published' event when succeeded", async function () {
        await expect(
            NFTOptContract.connect(buyer).publishOptionRequest(
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
        await deployMainContract();
    });

    it("prints gas limit", async function () {
        await publishDummyOptionRequest();
        const currentGas = (
            await NFTOptContract.connect(buyer).estimateGas.publishOptionRequest(
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
