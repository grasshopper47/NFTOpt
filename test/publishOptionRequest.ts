import { expect } from "chai";
import {
    buyer,
    initializer,
    deployNFTOptContract,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
} from "./utils";

describe("publishOptionRequest", function () {

    this.beforeAll("deploy", async function () {
        await initializer();
    });

    it("reverts when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(buyer.address, 1, 0, 0, 0))
            .to.be.revertedWith("NOT_AN_INTERFACE_OF");
    });

    it("reverts when called with 0 as NFT Token ID", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(NFTDummyCTR.address, 0, 0, 0, 0))
            .to.be.revertedWith("INVALID_TOKEN_ID");
    });

    it("reverts when NFT Token ID is under different ownership than the caller's", async function () {
        let owner = await NFTDummyCTR.ownerOf(21);

        expect(owner).to.be.equal(NFTDummyCTR.address);

        // Can't publish option request when not an owner
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(NFTDummyCTR.address, 21, 0, 0, 0))
            .to.be.revertedWith("NFT_NOT_OWNER");
    });

    it("reverts when called without a premium (transaction value)", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0))
            .to.be.revertedWith("INVALID_PREMIUM_AMOUNT");
    });

    it("reverts when called with 0 as Strike Price", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_STRIKE_PRICE_AMOUNT");
    });

    it("reverts when called with 0 as Interval", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(NFTDummyCTR.address, 1, 1, 0, 0, { value: 1 }))
            .to.be.revertedWith("INVALID_EXPIRATION_INTERVAL");
    });

    it("succeeds when called with valid values", async function () {
        const balance0 = await NFTOptCTR.getBalance();
        const optionID0 = await NFTOptCTR.optionID();

        expect(balance0).to.equal(0);
        expect(optionID0).to.equal(0);

        await publishDummyOptionRequest();

        const balance1 = await NFTOptCTR.getBalance();
        const optionID1 = await NFTOptCTR.optionID();

        expect(balance1).to.equal(dummyOptionRequest.premium);
        expect(optionID1).to.equal(1);

        // Check that details of the option data match those sent
        const option = await NFTOptCTR.options(1);

        expect(option.buyer).to.equal(dummyOptionRequest.buyer);
        expect(option.seller).to.equal(dummyOptionRequest.seller);
        expect(option.nftContract).to.equal(dummyOptionRequest.nftContract);
        expect(option.nftId).to.equal(dummyOptionRequest.nftId);
        expect(option.startDate).to.equal(dummyOptionRequest.startDate);
        expect(option.interval).to.equal(dummyOptionRequest.interval);
        expect(option.premium).to.equal(dummyOptionRequest.premium);
        expect(option.strikePrice).to.equal(dummyOptionRequest.strikePrice);
        expect(option.flavor).to.equal(dummyOptionRequest.flavor);
        expect(option.state).to.equal(dummyOptionRequest.state);

        // Reset the state
        await deployNFTOptContract();
    });

    it("emits 'NewRequest' event when succeeded", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .publishOptionRequest(
                dummyOptionRequest.nftContract,
                dummyOptionRequest.nftId,
                dummyOptionRequest.strikePrice,
                dummyOptionRequest.interval,
                dummyOptionRequest.flavor,
                { value: 1 }
            ))
            .to.emit(NFTOptCTR, "NewRequest")
            .withArgs(buyer.address, 1);

        // Reset the state
        await deployNFTOptContract();
    });
});