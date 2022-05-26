import { expect } from "chai";
import {
    buyer,
    seller,
    nonParticipant,
    increaseEVMTimestampBy,
    contractInitializer,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
    OptionState,
} from "./utils";

describe("cancelOption", function () {

    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    it("reverts with non-existent optionID", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(9999))
            .to.be.revertedWith("INVALID_OPTION_ID");
    });

    it("reverts when the option NOT in OPEN state", async function () {
        await publishDummyOptionRequest();

        var publishedOption = await NFTOptCTR.connect(buyer).options(1);
        expect(publishedOption.state).to.equal(OptionState.Request);

        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.be.revertedWith("INVALID_OPTION_STATE");
    });

    it("fails when option has already been exercised", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        // Fast-foward EVM by exercise date (interval 6 days) for european contract
        await increaseEVMTimestampBy((dummyOptionRequest.interval / (24 * 3600)) - 1);

        // Approve contract for transferring NFT
        NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, dummyOptionRequest.nftId);

        // Exercise option
        await expect(NFTOptCTR.connect(buyer)
            .exerciseOption(1))
            .to.emit(NFTOptCTR, "Exercised")
            .withArgs(1);

        let exercisedOption = await NFTOptCTR.connect(buyer).options(1);
        expect(exercisedOption.state).to.equal(OptionState.Closed);

        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.be.revertedWith("INVALID_OPTION_STATE");
    });

    it("fails when non-participant tries to cancel", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        // Fast-foward EVM by 2 days
        await increaseEVMTimestampBy(2);

        // Try to cancel
        await expect(NFTOptCTR.connect(seller)
            .cancelOption(1))
            .to.be.revertedWith("NOT_AUTHORIZED");

        // Fast-foward EVM by interval + 1 days
        await increaseEVMTimestampBy((dummyOptionRequest.interval / (24 * 3600)) + 1);

        // Try to cancel again
        await expect(NFTOptCTR.connect(nonParticipant)
            .cancelOption(1))
            .to.be.revertedWith("NOT_AUTHORIZED");
    });

    it("succeeds when called by seller after expiration date", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        // Try to cancel
        await expect(NFTOptCTR.connect(seller)
            .cancelOption(1))
            .to.be.revertedWith("NOT_AUTHORIZED");

        // Fast-foward EVM by interval + 1 days
        await increaseEVMTimestampBy((dummyOptionRequest.interval / (24 * 3600)) + 1);

        // Should be allowed to cancel when option is expired
        await expect(NFTOptCTR.connect(seller)
            .cancelOption(1))
            .to.emit(NFTOptCTR, "Canceled")
            .withArgs(seller.address, 1);
    });

    it("succeeds when called by buyer within specified interval", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        // Fast-foward EVM by 2 days; before expiry
        await increaseEVMTimestampBy(2);

        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.emit(NFTOptCTR, "Canceled")
            .withArgs(buyer.address, 1);
    });

    it("sends the collateral back to the seller", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        const sellerBalance0 = await seller.getBalance();

        // Cancel the option
        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.emit(NFTOptCTR, "Canceled")
            .withArgs(buyer.address, 1);

        // Check seller receives collateral
        let sellerBalance1 = await seller.getBalance();
        sellerBalance1 = sellerBalance1.sub(dummyOptionRequest.strikePrice);
        expect(sellerBalance0).to.equal(sellerBalance1);
    });

    it("emits 'Canceled' event", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        // Cancel the option
        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.emit(NFTOptCTR, "Canceled")
            .withArgs(buyer.address, 1);

        let cancelledOption = await NFTOptCTR.connect(buyer).options(1);
        expect(cancelledOption.state).to.equal(OptionState.Closed)
    });
});