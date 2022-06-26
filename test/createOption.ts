import { expect } from "chai";
import { OptionState } from "../src/utils/types";
import { buyer, seller, initializer, dummyOptionRequest, publishDummyOptionRequest } from "./utils/backend";
import { NFTOptContract, deployMainContract } from "../src/utils/deployment";

describe("createOption", function () {
    before("prepareEnv", async function () {
        await initializer();
    });

    it("reverts with non-existent optionID", async function () {
        await expect(NFTOptContract.connect(seller)
            .createOption(9999))
            .to.be.revertedWith("INVALID_OPTION_ID");
    });

    it("reverts when the option is already fulfilled by a seller", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened");

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.be.revertedWith("OPTION_REQUEST_ALREADY_FULFILLED");

        // Reset the state
        await deployMainContract();
    });

    it("reverts when the option is not in REQUEST state", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptContract.connect(buyer)
            .withdrawOptionRequest(0))
            .to.emit(NFTOptContract, "Withdrawn");

        await expect(NFTOptContract.connect(seller)
            .createOption(0))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployMainContract();
    });

    it("reverts when the option seller is the same as the option buyer", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptContract.connect(buyer)
            .createOption(0))
            .to.be.revertedWith("BUYER_MUST_DIFFER_FROM_SELLER");

        // Reset the state
        await deployMainContract();
    });

    it("reverts when the wrong strike price is provided by the seller", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice.sub(1) }))
            .to.be.revertedWith("INVALID_STRIKE_PRICE_AMOUNT");

        // Reset the state
        await deployMainContract();
    });

    it("succeeds when called with valid values", async function () {
        let contractBalance = await NFTOptContract.getBalance();

        expect(contractBalance).to.equal(0);

        await publishDummyOptionRequest();

        contractBalance = await NFTOptContract.getBalance();

        expect(contractBalance).to.equal(dummyOptionRequest.premium);

        // Seller responds to request and creates an option
        let sellerBalance0 = await seller.getBalance();

        let tx = NFTOptContract.connect(seller).createOption(0, { value: dummyOptionRequest.strikePrice });

        let transaction = await tx;
        let transactionReceipt = await transaction.wait();

        // Get transaction gas costs
        const gasUsed = transactionReceipt.gasUsed;
        const gasPrice = transaction.gasPrice;
        const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

        await expect(tx).to.emit(NFTOptContract, "Opened");

        // Check that the collateral was paid
        contractBalance = await NFTOptContract.getBalance();
        expect(contractBalance).to.equal(dummyOptionRequest.strikePrice);

        const updatedOption = await NFTOptContract.connect(seller).options(0);

        expect(updatedOption.startDate).to.not.equal(0);
        expect(updatedOption.seller).to.equal(seller.address);
        expect(updatedOption.state).to.equal(OptionState.OPEN);

        // Check that the seller's new balance is equal with the initial balance - gas used in transaction + premium - strikePrice
        let sellerBalance1 = await seller.getBalance();

        sellerBalance1 = sellerBalance1
            .sub(updatedOption.premium)
            .add(dummyOptionRequest.strikePrice)
            .add(gasUsedInTransaction);

        expect(sellerBalance0).to.equal(sellerBalance1);

        // Reset the state
        await deployMainContract();
    });

    it("emits 'Filled' event when succeeded", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened")
            .withArgs(0);

        // Reset the state
        await deployMainContract();
    });
});
