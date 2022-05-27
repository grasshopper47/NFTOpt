import {expect} from "chai";
import {
    address_empty,
    buyer,
    seller,
    initializer,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
    OptionFlavor,
    OptionState,
} from "./utils";

beforeEach("deploy contract", async () => {
    await initializer();
});

describe("withdrawOptionRequest", function () {
    it("should fail when option request does not exist", async function () {
        await publishDummyOptionRequest();
        await expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(9999)).to.be.revertedWith("INVALID_OPTION_ID");
    });

    it("should fail when option not in REQUEST state", async function () {
        await publishDummyOptionRequest();
        // Fill option
        await expect(NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})).to.emit(
            NFTOptCTR,
            "Filled"
        );

        await expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(1)).to.be.revertedWith("INVALID_OPTION_STATE");
    });

    it("should fail when caller is not the buyer", async function () {
        await publishDummyOptionRequest();
        await expect(NFTOptCTR.connect(seller).withdrawOptionRequest(1)).to.be.revertedWith("NOT_AUTHORIZED");
    });

    it("Buyer should receive premium back when success", async function () {
        await publishDummyOptionRequest();
        let buyerBalance0 = await buyer.getBalance();

        // Withdraw option request
        let tx = NFTOptCTR.connect(buyer).withdrawOptionRequest(1);
        await expect(tx).to.emit(NFTOptCTR, "Withdrawn");

        let transaction = await tx;
        let transactionReceipt = await transaction.wait();

        // Get 'withdraw option' transaction gas costs
        const gasUsed = transactionReceipt.gasUsed;
        const gasPrice = transaction.gasPrice;
        const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

        buyerBalance0 = buyerBalance0.add(dummyOptionRequest.premium).sub(gasUsedInTransaction);

        const buyerBalance1 = await buyer.getBalance();

        // Check balance of option buyer
        expect(buyerBalance0).to.be.equal(buyerBalance1);
    });
});
