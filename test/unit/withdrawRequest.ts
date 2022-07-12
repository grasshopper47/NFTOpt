import { expect } from "chai";

import { buyer, seller, initializer, dummyOptionRequest, publishDummyRequest } from "../helpers";
import { NFTOptContract, deployMainContract } from "../../src/utils/deployment";
import { ADDRESS0, BIGNUMBER0 } from "../../src/utils/constants";

describe("withdrawRequest", function () {
    before("prepareEnv", async function () {
        await initializer();

        await publishDummyRequest();
    });

    it("fails when option request does not exist", async function () {
        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(9999))
            .to.be.revertedWith("INVALID_ID");
    });

    it("fails when caller is not the buyer", async function () {
        await expect(NFTOptContract.connect(seller)
            .withdrawRequest(0))
            .to.be.revertedWith("NOT_AUTHORIZED");
    });

    it("fails when option not in REQUEST state", async function () {
        // Fill option
        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened");

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.be.revertedWith("INVALID_ID");

        // Reset the state
        await deployMainContract();
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
        await deployMainContract();
    });

    it("removes request from storage after successful withdrawal", async function () {
        await publishDummyRequest();

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.emit(NFTOptContract, "Withdrawn");

        let request = await NFTOptContract.requests(0);

        expect(request[0]).to.be.equal(BIGNUMBER0);
        expect(request[1]).to.be.equal(BIGNUMBER0);
        expect(request[2]).to.be.equal(BIGNUMBER0);
        expect(request[3]).to.be.equal(ADDRESS0);
        expect(request[4]).to.be.equal(0);
        expect(request[5]).to.be.equal(BIGNUMBER0);
        expect(request[6]).to.be.equal(ADDRESS0);

        // Reset the state
        await deployMainContract();
    });

    it("reuses storage slots after successful withdrawal", async function () {
        await publishDummyRequest();
        await publishDummyRequest();

        await expect(NFTOptContract.connect(buyer)
            .withdrawRequest(0))
            .to.emit(NFTOptContract, "Withdrawn");

        let request = await NFTOptContract.requests(0);

        expect(request[0]).to.be.equal(BIGNUMBER0);
        expect(request[1]).to.be.equal(BIGNUMBER0);
        expect(request[2]).to.be.equal(BIGNUMBER0);
        expect(request[3]).to.be.equal(ADDRESS0);
        expect(request[4]).to.be.equal(0);
        expect(request[5]).to.be.equal(BIGNUMBER0);
        expect(request[6]).to.be.equal(ADDRESS0);

        await publishDummyRequest();

        request = await NFTOptContract.requests(0);

        expect(request.buyer).to.equal(dummyOptionRequest.buyer);
        expect(request.nftContract).to.equal(dummyOptionRequest.nftContract);
        expect(request.nftId).to.equal(dummyOptionRequest.nftId);
        expect(request.interval).to.equal(dummyOptionRequest.interval);
        expect(request.premium).to.equal(dummyOptionRequest.premium);
        expect(request.strikePrice).to.equal(dummyOptionRequest.strikePrice);
        expect(request.flavor).to.equal(dummyOptionRequest.flavor);

        // Reset the state
        await deployMainContract();
    });

    it("prints gas limit", async function () {
        await publishDummyRequest();

        const currentGas = (await NFTOptContract.connect(buyer).estimateGas.withdrawRequest(0)).toNumber();

        console.log(currentGas);
    });
});
