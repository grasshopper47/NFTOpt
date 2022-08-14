import { expect } from "chai";

import { buyer, seller, initializer, dummyOptionRequest, publishDummyRequest, NFTDummyContract, addDaysToEVM } from "../helpers";
import { NFTOptContract, deployNFTOptContract } from "../../utils/deployment/NFTOpt";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../../utils/constants";

describe("withdrawRequest", function () {
    before("prepareEnv", async function () {
        await initializer();

        await publishDummyRequest();
    });

    it("fails when request does not exist", async function () {
        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(9999))
            .to.be.revertedWith("INVALID_ID");
    });

    it("fails when caller is not the buyer", async function () {
        await expect(NFTOptContract.connect(seller)
            .withdrawRequest(0))
            .to.be.revertedWith("NOT_AUTHORIZED");
    });

    it("fails when option not OPEN", async function () {
        // Fill option
        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened");

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployNFTOptContract();
    });

    it("fails when option is EXERCISED", async function () {

        await publishDummyRequest();

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened");

        await NFTDummyContract.connect(buyer)
            .approve(NFTOptContract.address, dummyOptionRequest.nftId);

        // Fast-foward EVM by 2 days
        await addDaysToEVM(6);

        await expect(NFTOptContract.connect(buyer)
            .exerciseOption(0))
            .to.emit(NFTOptContract, "Exercised");

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Transfer NFT from seller back to buyer
        await NFTDummyContract.connect(seller).approve(buyer.address, dummyOptionRequest.nftId);
        await NFTDummyContract.connect(buyer).transferFrom(seller.address, buyer.address, dummyOptionRequest.nftId);

        // Reset the state
        await deployNFTOptContract();
    });

    it("fails when option is CANCELED", async function () {

        await publishDummyRequest();

        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened");

        await expect(NFTOptContract.connect(buyer)
            .cancelOption(0))
            .to.emit(NFTOptContract, "Canceled");

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployNFTOptContract();
    });

    it("sends premium to buyer on success", async function () {
        await publishDummyRequest();

        let buyerBalance0 = await buyer.getBalance();

        // Withdraw option request
        let tx = NFTOptContract.connect(buyer).withdrawRequest(0);
        await expect(tx).to.emit(NFTOptContract, "Withdrawn");

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

    it("removes request from storage after successful withdrawal", async function () {
        await publishDummyRequest();

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.emit(NFTOptContract, "Withdrawn");

        let request = await NFTOptContract.options(0);
        expect(request[4]).to.be.equal(ADDRESS0); // buyer (5th field) == 0 means invalid option

        // Reset the state
        await deployNFTOptContract();
    });

    it("reuses storage slots after successful withdrawal", async function () {
        await publishDummyRequest();
        await publishDummyRequest();

        expect(
            await NFTOptContract.connect(buyer).withdrawRequest(0)
        ).to.not.throw;

        await publishDummyRequest();

        let request = await NFTOptContract.options(0);

        expect(request.buyer).to.equal(dummyOptionRequest.buyer);
        expect(request.nftContract).to.equal(dummyOptionRequest.nftContract);
        expect(request.nftId).to.equal(dummyOptionRequest.nftId);
        expect(request.interval).to.equal(dummyOptionRequest.interval);
        expect(request.premium).to.equal(dummyOptionRequest.premium);
        expect(request.strikePrice).to.equal(dummyOptionRequest.strikePrice);
        expect(request.flavor).to.equal(dummyOptionRequest.flavor);

        // Reset the state
        await deployNFTOptContract();
    });

    it("prints gas limit", async function () {
        await publishDummyRequest();

        const currentGas = (await NFTOptContract.connect(buyer).estimateGas.withdrawRequest(0)).toNumber();

        console.log(currentGas);
    });
});
