import { expect } from "chai";
import {
    buyer,
    seller,
    NFTOptCTR,
    contractInitializer,
    dummyOptionRequest,
    publishDummyOptionRequest,
    OptionState,
} from "./utils";

describe("NFTOpt Tests", function () {
    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    describe("createOption", function () {
        it("fails when the option with the specified id does not exist", async function () {
            await expect(NFTOptCTR.connect(seller)
                .createOption(0))
                .to.be.revertedWith("Option with the specified id does not exist");
        });

        it("fails when the option is already fulfilled by a seller", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller)
                .createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.not.reverted;

            await expect(NFTOptCTR.connect(seller)
                .createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.be.revertedWith("Option is already fulfilled by a seller");
        });

        it("fails when the option is not in the request state", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(buyer)
                .withdrawOptionRequest(1))
                .to.not.be.reverted;

            await expect(NFTOptCTR.connect(seller)
                .createOption(1))
                .to.be.revertedWith("Option is not in the request state");
        });

        it("fails when the option seller is the same as the option buyer", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(buyer)
                .createOption(1))
                .to.be.revertedWith("Seller is the same as buyer");
        });

        it("fails when the wrong strike price is provided by the seller", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller)
                .createOption(1, { value: dummyOptionRequest.strikePrice.sub(1) }))
                .to.be.revertedWith("Wrong strike price provided");
        });

        it("succeeds when called with valid values", async function () {
            let contractBalance = await NFTOptCTR.getBalance();

            expect(contractBalance).to.equal(0);

            await publishDummyOptionRequest();

            contractBalance = await NFTOptCTR.getBalance();

            expect(contractBalance).to.equal(dummyOptionRequest.premium);

            // Seller responds to request and creates an option
            let sellerBalance0 = await seller.getBalance();

            let tx = NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice });

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // Get transaction gas costs
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            await expect(tx).to.emit(NFTOptCTR, "Filled");

            // Check that the collateral was paid
            contractBalance = await NFTOptCTR.getBalance();
            expect(contractBalance).to.equal(dummyOptionRequest.strikePrice);

            const updatedOption = await NFTOptCTR.connect(seller).options(1);

            // Check that the option startDate was updated
            expect(updatedOption.startDate).to.not.equal(0);

            // Check that the option seller address was updated
            expect(updatedOption.seller).to.equal(seller.address);

            // Check that the option state was updated to Open
            expect(updatedOption.state).to.equal(OptionState.Open);

            // Check that the seller's new balance is equal with the initial balance - gas used in transaction + premium - strikePrice
            let sellerBalance1 = await seller.getBalance();

            sellerBalance1 = sellerBalance1.sub(updatedOption.premium)
                .add(dummyOptionRequest.strikePrice)
                .add(gasUsedInTransaction);

            expect(sellerBalance0).to.equal(sellerBalance1);
        });

        it("emits 'Filled' event when succeeded", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller)
                .createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);
        });
    });
});
