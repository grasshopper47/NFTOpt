import { expect } from "chai";
import {
    buyer,
    seller,
    contractInitializer,
    increaseEVMTimestampBy,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
    OptionFlavor,
} from "./utils";

let optionAmerican: any;
let optionEuropean: any;

describe("NFTOpt Tests", function () {
    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    describe("exerciseOption", function () {
        beforeEach("create_option_for_exercise", async function () {
            // Publish American option
            await NFTOptCTR.connect(buyer).publishOptionRequest(
                dummyOptionRequest.nftContract,
                dummyOptionRequest.nftId,
                dummyOptionRequest.strikePrice,
                dummyOptionRequest.interval,
                OptionFlavor.American,
                { value: dummyOptionRequest.premium }
            );

            // Publish European option
            await NFTOptCTR.connect(buyer).publishOptionRequest(
                dummyOptionRequest.nftContract,
                17,
                dummyOptionRequest.strikePrice,
                dummyOptionRequest.interval,
                dummyOptionRequest.flavor,
                { value: dummyOptionRequest.premium }
            );

            await publishDummyOptionRequest();

            // Fill option requests
            await NFTOptCTR.connect(seller).createOption(1, { value: dummyOptionRequest.strikePrice });
            await NFTOptCTR.connect(seller).createOption(2, { value: dummyOptionRequest.strikePrice });

            // Load option details -- TODO: store as Option struct; need to transform, as Solidity returns tuples
            optionAmerican = await NFTOptCTR.options(1);
            optionEuropean = await NFTOptCTR.options(2);
        });

        it("reverts with non-existent optionID", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(9999))
                .to.be.revertedWith("INVALID_OPTION_ID");
        });

        it("reverts when msg.sender isn't the buyer", async function () {
            await expect(NFTOptCTR.connect(seller)
                .exerciseOption(1))
                .to.be.revertedWith("NOT_AUTHORIZED");
        });

        it("reverts when buyer isn't the owner of option NFT after option is in effect", async function () {
            // Transfer NFT from buyer to seller
            await NFTDummyCTR.connect(buyer).transferFrom(buyer.address, seller.address, optionAmerican.nftId);

            // Exercise option
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(1))
                .to.be.revertedWith("NFT_NOT_OWNER");
        });

        it("reverts when option state is not OPEN", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(3))
                .to.be.revertedWith("INVALID_OPTION_STATE");
        });

        it("fails when contract address is not approved to transfer NFT", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(1))
                .to.be.revertedWith("NFT_NOT_APPROVED");
        });

        it("succeeds when contract address is approved to transfer NFT", async function () {
            // Approve contract to transfer NFT
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, dummyOptionRequest.nftId);

            // Exercise option
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(1))
                .to.emit(NFTOptCTR, "Exercised")
                .withArgs(1);
        });

        it("fails when european option is exercised before the expiration day", async function () {
            // Approve contract to transfer NFT
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, optionEuropean.nftId);

            // Exercise option
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(2))
                .to.be.revertedWith("EXERCISE_WINDOW_IS_CLOSED");
        });

        it("succeeds when european option is exercised on expiration day", async function () {
            // Approve contract to transfer NFT
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, optionEuropean.nftId);

            // Fast-foward EVM by interval - 1 day (to the day of exercise)
            await increaseEVMTimestampBy((dummyOptionRequest.interval / (24 * 3600)) - 1);

            // Exercise option
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(2))
                .to.emit(NFTOptCTR, "Exercised")
                .withArgs(2);
        });

        it("succeeds when american option is exercised on expiration day", async function () {
            // Approve contract to transfer NFT
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, optionAmerican.nftId);

            // Fast-foward EVM by 2 days
            await increaseEVMTimestampBy(2);

            // Exercise option
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(1))
                .to.emit(NFTOptCTR, "Exercised")
                .withArgs(1);
        });

        it("succeeds when exercised and buyer's ETH balance has increased by STRIKE_PRICE", async function () {
            // Approve contract to transfer NFT
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, optionAmerican.nftId);

            let buyerBalance0 = await buyer.getBalance();

            // Exercise option (promise)
            let tx = NFTOptCTR.connect(buyer).exerciseOption(1);

            // Exercise option
            await expect(tx)
                .to.emit(NFTOptCTR, "Exercised")
                .withArgs(1);

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // Get 'exercise option' transaction gas costs
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            buyerBalance0 = buyerBalance0.add(optionAmerican.strikePrice).sub(gasUsedInTransaction);

            const buyerBalance1 = await buyer.getBalance();

            // Check balance of option buyer
            expect(buyerBalance0).to.be.equal(buyerBalance1);
        });

        it("succeeds when exercised and seller has ownership of NFT transfered ", async function () {
            const id = 1;

            // Load option
            const option = await NFTOptCTR.options(id);

            // Approve contract to transfer NFT
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, option.nftId);

            // Exercise option
            await expect(NFTOptCTR.connect(buyer)
                .exerciseOption(id))
                .to.emit(NFTOptCTR, "Exercised")
                .withArgs(id);

            // Check NFT ownership
            let owner = await NFTDummyCTR.ownerOf(option.nftId);
            expect(owner).to.equal(seller.address);
        });
    });
});
