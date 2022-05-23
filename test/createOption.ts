import {expect} from "chai";
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

    describe("createOption", function () {
        it("should fail when the option with the specified id does not exist", async function () {
            await expect(NFTOptCTR.connect(seller).createOption(0)).to.be.revertedWith("Option with the specified id does not exist");
        });

        it("should fail when the option is already fulfilled by a seller", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})).to.not.reverted;

            await expect(NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})).to.be.revertedWith(
                "Option is already fulfilled by a seller"
            );
        });

        it("should fail when the option is not in the request state", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(1)).to.not.be.reverted;

            await expect(NFTOptCTR.connect(seller).createOption(1)).to.be.revertedWith("Option is not in the request state");
        });

        it("should fail when the option seller is the same as the option buyer", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(buyer).createOption(1)).to.be.revertedWith("Seller is the same as buyer");
        });

        it("should fail when the wrong strike price is provided by the seller", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice.sub(1)})).to.be.revertedWith(
                "Wrong strike price provided"
            );
        });

        it("should succeed when called with valid values", async function () {
            const initialSellerBalance = await seller.getBalance();

            expect(await NFTOptCTR.getBalance()).to.equal(0);

            await publishDummyOptionRequest();

            expect(await NFTOptCTR.getBalance()).to.equal(dummyOptionRequest.premium);

            // Seller responds to request and creates an option
            let tx = NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice});

            expect(tx).to.not.be.reverted;

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // Check that the collateral was paid
            expect(await NFTOptCTR.getBalance()).to.equal(dummyOptionRequest.strikePrice);

            const updatedOption = await NFTOptCTR.connect(seller).options(1);

            // Check that the option startDate was updated
            expect(updatedOption.startDate).to.not.equal(0);

            // Check that the option seller address was updated
            expect(updatedOption.seller).to.equal(seller.address);

            // Check that the option state was updated to Open
            expect(updatedOption.state).to.equal(OptionState.Open);

            // Check that the seller's new balance is equal with the initial balance - gas used in transaction + premium - strikePrice
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            expect(await seller.getBalance()).to.equal(
                initialSellerBalance.add(updatedOption.premium).sub(dummyOptionRequest.strikePrice).sub(gasUsedInTransaction)
            );
        });

        it("should emit Filled event when succeeded", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice}))
                .to.emit(NFTOptCTR, "Filled")
                .withArgs(seller.address, 1);
        });
    });
});
