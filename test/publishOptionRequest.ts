import { expect } from "chai";
import {
    address0,
    buyer,
    contractInitializer,
    dummyOptionRequest,
    increaseEVMTimestampBy,
    NFTDummyCTR,
    NFTOptCTR,
    OptionFlavor,
    OptionState,
    publishDummyOptionRequest,
    seller,
} from "./utils";

describe("NFTOpt Tests", function () {
    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    describe("publishOptionRequest", function () {
        it("should fail when called with address(0) as NFT Contract Address", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(address0, 0, 0, 0, 0))
                .to.be.revertedWith("NFT contract must be a valid address");
        });

        it("should fail when called with 0 as NFT Token ID", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(buyer.address, 0, 0, 0, 0))
                .to.be.revertedWith("NFT token ID must be > 0");
        });

        it("should fail when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(buyer.address, 1, 0, 0, 0))
                .to.be.revertedWith("Provided NFT contract address must implement ERC-721 interface");
        });

        it("should fail when NFT Token ID is under different ownership than the caller's", async function () {
            // Send NFT ID 3 to seller
            let _nftID = 3;
            await NFTDummyCTR.connect(buyer).transferFrom(buyer.address, seller.address, _nftID);

            let owner = await NFTDummyCTR.ownerOf(_nftID);

            expect(owner).to.be.equal(seller.address);

            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(NFTDummyCTR.address, _nftID, 0, 0, 0))
                .to.be.revertedWith("NOT_NFT_OWNER");
        });

        it("should fail when called without a premium (transaction value)", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0))
                .to.be.revertedWith("Premium must be > 0");
        });

        it("should fail when called with 0 as Strike Price", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0, { value: 1 }))
                .to.be.revertedWith("Strike price must be > 0");
        });

        it("should fail when called with 0 as Interval", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(NFTDummyCTR.address, 1, 1, 0, 0, { value: 1 }))
                .to.be.revertedWith("Expiration interval must be > 0");
        });

        it("should succeed when called with valid values", async function () {
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
        });

        it("should emit NewRequest event when succeeded", async function () {
            await expect(publishDummyOptionRequest())
                .to.emit(NFTOptCTR, "NewRequest")
                .withArgs(buyer.address, 1);
        });
    });
});
