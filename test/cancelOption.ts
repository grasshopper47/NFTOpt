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

describe("NFTOpt Tests", function () {

    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    describe("cancelOption", function () {

        it("should test that the option exists", async function () {
            await expect(NFTOptCTR.connect(buyer).cancelOption(0)).to.be.revertedWith(
                "The Option does not exist"
            );
        });

        it("should revert when the option does not have a start date (not filled) i.e. published: REQUEST state", async function () {
            await publishDummyOptionRequest();

            var publishedOption = await NFTOptCTR.connect(buyer).options(1);
            expect(publishedOption.state).to.equal(OptionState.Request);

            await expect(NFTOptCTR.connect(buyer).cancelOption(1)).to.be.revertedWith(
                "The Option is not open"
            );
        });

        it("should revert when option is NOT in OPEN state i.e. published: REQUEST or '_exercised_'/cancelled: CLOSED states", async function () {
            await publishDummyOptionRequest();

            // filled
            await expect(NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);

            // exercised
            // Fast-foward EVM by exercise date (interval 6 days) for european contract
            await increaseEVMTimestampBy(6);
            await expect(NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, dummyOptionRequest.nftId));
            await expect(NFTOptCTR.connect(buyer).exerciseOption(1))
                .to.emit(NFTOptCTR, "Exercised")
                .withArgs(1);

            let exercisedOption = await NFTOptCTR.connect(buyer).options(1);
            expect(exercisedOption.state).to.equal(OptionState.Closed);

            await expect(NFTOptCTR.connect(buyer).cancelOption(1)).to.be.revertedWith(
                "The Option is not open"
            );
        });

        it("should revert when option is NOT in OPEN state i.e. published: REQUEST or exercised/'_cancelled_': CLOSED states", async function () {
            await publishDummyOptionRequest();

            // filled
            await expect(NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);

            // already canceled
            await expect(NFTOptCTR.connect(buyer).cancelOption(1))
                .to.emit(NFTOptCTR, "Canceled")
                .withArgs(buyer.address, 1);

            await expect(NFTOptCTR.connect(buyer).cancelOption(1)).to.be.revertedWith(
                "The Option is not open"
            );
        });

        it("should test seller is permitted to cancel only expired filled option", async function () {
            await publishDummyOptionRequest();

            // filled
            await expect(NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);

            // Fast-foward EVM by 2 days
            await increaseEVMTimestampBy(2);

            await expect(NFTOptCTR.connect(seller).cancelOption(1)).to.be.revertedWith(
                "Only Buyer can cancel"
            );

            // Fast-foward EVM by 8 days; post expiry (7)
            await increaseEVMTimestampBy(8);

            await expect(NFTOptCTR.connect(nonParticipant).cancelOption(1)).to.be.revertedWith(
                "Only Buyer or Seller can cancel"
            );

            await expect(NFTOptCTR.connect(seller).cancelOption(1))
                .to.emit(NFTOptCTR, "Canceled")
                .withArgs(seller.address, 1);
        });

        it("should test that method can be called", async function () {
            await publishDummyOptionRequest();

            // filled
            await expect(NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);

            // Fast-foward EVM by 2 days; before expiry
            await increaseEVMTimestampBy(2);

            await expect(NFTOptCTR.connect(buyer).cancelOption(1))
                .to.emit(NFTOptCTR, "Canceled")
                .withArgs(buyer.address, 1);
        });

        it("should test the collateral (in contract) is transferred back to the seller", async function () {
            await publishDummyOptionRequest();

            // filled
            await expect(NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);

            const initialBuyerBalance = await buyer.getBalance();
            const initialSellerBalance = await seller.getBalance();

            // buyer cancels option
            let tx = NFTOptCTR.connect(buyer).cancelOption(1);
            await expect(tx).to.not.be.reverted;

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // calculate gas costs
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            const updatedOption = await NFTOptCTR.connect(seller).options(1);

            // Check buyer incurs cancellation transaction costs
            expect(await buyer.getBalance()).to.equal(
                initialBuyerBalance.sub(gasUsedInTransaction)
            );

            // Check seller receives collateral
            expect(await seller.getBalance()).to.equal(
                initialSellerBalance.add(dummyOptionRequest.strikePrice)
            );
        });

        it("should emit Canceled event when succeeded w/ expected CLOSED state", async function () {
            await publishDummyOptionRequest();

            // filled
            await expect(NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);

            // canceled
            await expect(NFTOptCTR.connect(buyer).cancelOption(1))
                .to.emit(NFTOptCTR, "Canceled")
                .withArgs(buyer.address, 1);

            let cancelledOption = await NFTOptCTR.connect(buyer).options(1);
            expect(cancelledOption.state).to.equal(OptionState.Closed)
        });

    });

});
