import { expect } from "chai";
import { OptionState } from "../src/utils/types"
import {
    buyer,
    seller,
    nonParticipant,
    increaseEVMTimestampBy,
    deployNFTOptContract,
    deployNFTDummyContract,
    initializer,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
} from "../src/utils/backend";
import { SECONDS_IN_A_DAY } from "../src/utils/constants";

describe("cancelOption", function () {

    this.beforeAll("deploy", async function () {
        await initializer();
    });

    it("reverts with non-existent optionID", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(9999))
            .to.be.revertedWith("INVALID_OPTION_ID");
    });

    it("reverts when option state is not OPEN", async function () {
        await publishDummyOptionRequest();

        var publishedOption = await NFTOptCTR.connect(buyer).options(1);
        expect(publishedOption.state).to.equal(OptionState.REQUEST);

        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployNFTOptContract();
    });

    it("reverts when option has already been exercised", async function () {
        await publishDummyOptionRequest();

        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptCTR, "Filled")
            .withArgs(seller.address, 1);

        // Fast-foward EVM by exercise date (interval 6 days) for european contract
        await increaseEVMTimestampBy((dummyOptionRequest.interval / SECONDS_IN_A_DAY) - 1);

        // Approve contract for transferring NFT
        NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, dummyOptionRequest.nftId);

        // Exercise option
        await expect(NFTOptCTR.connect(buyer)
            .exerciseOption(1))
            .to.emit(NFTOptCTR, "Exercised")
            .withArgs(1);

        let exercisedOption = await NFTOptCTR.connect(buyer).options(1);
        expect(exercisedOption.state).to.equal(OptionState.CLOSED);

        await expect(NFTOptCTR.connect(buyer)
            .cancelOption(1))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployNFTOptContract();
        await deployNFTDummyContract();
    });

    it("reverts when non-participant tries to cancel", async function () {
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
        await increaseEVMTimestampBy((dummyOptionRequest.interval / SECONDS_IN_A_DAY) + 1);

        // Try to cancel again
        await expect(NFTOptCTR.connect(nonParticipant)
            .cancelOption(1))
            .to.be.revertedWith("NOT_AUTHORIZED");

        // Reset the state
        await deployNFTOptContract();
        await deployNFTDummyContract();
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
        await increaseEVMTimestampBy((dummyOptionRequest.interval / SECONDS_IN_A_DAY) + 1);

        // Should be allowed to cancel when option is expired
        await expect(NFTOptCTR.connect(seller)
            .cancelOption(1))
            .to.emit(NFTOptCTR, "Canceled")
            .withArgs(seller.address, 1);

        // Reset the state
        await deployNFTOptContract();
        await deployNFTDummyContract();
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

        // Reset the state
        await deployNFTOptContract();
        await deployNFTDummyContract();
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

        // Reset the state
        await deployNFTOptContract();
        await deployNFTDummyContract();
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
        expect(cancelledOption.state).to.equal(OptionState.CLOSED);

        // Reset the state
        await deployNFTOptContract();
    });
});