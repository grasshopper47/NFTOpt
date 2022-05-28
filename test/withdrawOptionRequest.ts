import { expect } from "chai";
import { OptionState } from "../src/utils/types";

import {
    buyer,
    seller,
    initializer,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
    deployNFTOptContract,
} from "../src/utils/backend";

describe("withdrawOptionRequest", function () {

    this.beforeAll("deploy", async function () {
        await initializer();

        await publishDummyOptionRequest();
    });

    it("fails when option request does not exist", async function () {
        await expect(NFTOptCTR.connect(buyer)
            .withdrawOptionRequest(9999))
            .to.be.revertedWith("INVALID_OPTION_ID");
    });

    it("fails when caller is not the buyer", async function () {
        await expect(NFTOptCTR.connect(seller)
            .withdrawOptionRequest(1))
            .to.be.revertedWith("NOT_AUTHORIZED");
    });

    it("fails when option not in REQUEST state", async function () {
        // Fill option
        await expect(NFTOptCTR.connect(seller)
            .createOption(1, { value: dummyOptionRequest.strikePrice }))
            .to.emit(
                NFTOptCTR,
                "Filled"
            );

        await expect(NFTOptCTR.connect(buyer)
            .withdrawOptionRequest(1))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployNFTOptContract();
    });

    it("sends premium to buyer on success", async function () {
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

        // Reset the state
        await deployNFTOptContract();
    });

    it("has status 'WITHDRAWN' after withdrawal was successful", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptCTR.connect(buyer)
            .withdrawOptionRequest(1))
            .to.emit(NFTOptCTR, "Withdrawn");

        let option = await NFTOptCTR.options(1);
        expect(option.state).to.be.equal(OptionState.WITHDRAWN);

        // Reset the state
        await deployNFTOptContract();
    });
});