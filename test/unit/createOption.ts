import { expect } from "chai";
import { OptionState } from "../../src/models/option";
import { buyer, seller, initializer, dummyOptionRequest, publishDummyOptionRequest } from "../helpers";
import { NFTOptContract, deployMainContract } from "../../src/utils/deployment";
import { ethers } from "hardhat";

describe("createOption", function () {
    before("prepareEnv", async function () {
        await initializer();
    });

    it("reverts with non-existent requestID", async function () {
        await expect(NFTOptContract.connect(seller)
            .createOption(9999))
            .to.be.revertedWith("INVALID_ID");
    });

    it("reverts when the option is not in REQUEST state", async function () {
        await publishDummyOptionRequest();

        expect(
            await NFTOptContract.connect(buyer).withdrawOptionRequest(0)
        ).to.not.throw;

        await expect(NFTOptContract.connect(seller)
            .createOption(0))
            .to.be.revertedWith("INVALID_ID");

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
        let contractBalance = await ethers.provider.getBalance(NFTOptContract.address);

        expect(contractBalance).to.equal(0);

        await publishDummyOptionRequest();

        contractBalance = await ethers.provider.getBalance(NFTOptContract.address);

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
        contractBalance = await ethers.provider.getBalance(NFTOptContract.address);
        expect(contractBalance).to.equal(dummyOptionRequest.strikePrice);

        const option = await NFTOptContract.connect(seller).options(0);

        expect(option.startDate).to.not.equal(0);
        expect(option.seller).to.equal(seller.address);
        expect(option.state).to.equal(OptionState.OPEN);

        // Check that the seller's new balance is equal with the initial balance - gas used in transaction + premium - strikePrice
        let sellerBalance1 = await seller.getBalance();

        sellerBalance1 = sellerBalance1
            .sub(option.request.premium)
            .add(dummyOptionRequest.strikePrice)
            .add(gasUsedInTransaction);

        expect(sellerBalance0).to.equal(sellerBalance1);

        // Reset the state
        await deployMainContract();
    });

    it("emits 'Opened' event when succeeded", async function () {
        await publishDummyOptionRequest();

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened")
            .withArgs(0);

        // Reset the state
        await deployMainContract();
    });

    it("prints gas limit", async function () {
        await publishDummyOptionRequest();
        const currentGas = (await NFTOptContract.connect(seller).estimateGas.createOption(0, { value: dummyOptionRequest.strikePrice })).toNumber();
        console.log(currentGas);
    });
});
