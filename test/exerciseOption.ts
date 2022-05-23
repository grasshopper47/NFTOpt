import {expect} from "chai";
import {
    buyer,
    contractInitializer,
    dummyOptionRequest,
    increaseEVMTimestampBy,
    NFTDummyCTR,
    NFTOptCTR,
    OptionFlavor,
    seller,
} from "./utils";

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
                {value: dummyOptionRequest.premium}
            );

            // Publish European option
            await NFTOptCTR.connect(buyer).publishOptionRequest(
                dummyOptionRequest.nftContract,
                17,
                dummyOptionRequest.strikePrice,
                dummyOptionRequest.interval,
                dummyOptionRequest.flavor,
                {value: dummyOptionRequest.premium}
            );

            // Fill option ID 1 (American)
            await NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice});
        });

        it("should revert with non-existent optionID", async function () {
            await expect(NFTOptCTR.connect(buyer).exerciseOption(9999)).to.be.revertedWith("INVALID_OPTION_ID");
        });

        it("only option buyer can execute", async function () {
            await expect(NFTOptCTR.connect(seller).exerciseOption(1)).to.be.revertedWith("NOT_AUTHORIZED");
        });

        it("Buyer must be owner of the NFT id", async function () {
            let option = await NFTOptCTR.options(2);

            // Fill option 2 so as not fail under different test
            await NFTOptCTR.connect(seller).createOption(2, {value: option.strikePrice});

            // Transfer NFT 17 to seller and then try to excercise
            await NFTDummyCTR.connect(buyer).transferFrom(buyer.address, seller.address, option.nftId);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(2)).to.be.revertedWith("NOT_NFT_OWNER");
        });

        it("should revert with non-open options", async function () {
            await expect(NFTOptCTR.connect(buyer).exerciseOption(2)).to.be.revertedWith("INVALID_OPTION_STATE");
        });

        it("contract address must be approved to transfer NFT", async function () {
            // Try exercise without approval
            await expect(NFTOptCTR.connect(buyer).exerciseOption(1)).to.be.revertedWith("NFT_NOT_APPROVED");

            // Approve contract and try again
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, dummyOptionRequest.nftId);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(1)).to.not.be.reverted;
        });

        it("european option should not be exercised before the expiration day", async function () {
            // Fill option ID 2 and approve contract for NFT
            const _optionID = 2;
            await NFTOptCTR.connect(seller).createOption(_optionID, {value: dummyOptionRequest.strikePrice});

            let europeanFilledOption = await NFTOptCTR.options(_optionID);

            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, europeanFilledOption.nftId);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(_optionID)).to.be.revertedWith("EXERCISE_WINDOW_IS_CLOSED");

            // Fast-foward EVM by 6 days
            await increaseEVMTimestampBy(6);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(_optionID)).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);
        });

        it("american option should be able to exercise before the expiration day", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);

            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, americanFilledOption.nftId);

            // Fast-foward EVM by 2 days
            await increaseEVMTimestampBy(2);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(_optionID)).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);
        });

        it("Upon exercise, BUYER must have  increased his ETH balance by STRIKE_PRICE", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);

            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, americanFilledOption.nftId);

            let oldBuyerBalance = await buyer.getBalance();

            let tx = NFTOptCTR.connect(buyer).exerciseOption(_optionID);

            expect(tx).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // Calculate gas costs
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            // Check balance of option buyer
            expect(await buyer.getBalance()).to.be.equal(oldBuyerBalance.add(americanFilledOption.strikePrice).sub(gasUsedInTransaction));
        });

        it("Upon exercise, SELLER must have ownership of NFT_ID", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);
            await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, americanFilledOption.nftId);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(_optionID)).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);

            // Check NFT ownership
            expect(await NFTDummyCTR.ownerOf(americanFilledOption.nftId)).to.be.equal(seller.address);
        });
    });
});
