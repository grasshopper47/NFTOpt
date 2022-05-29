import {expect} from "chai";
import {OptionFlavor} from "../src/utils/types";
import {
    buyer,
    seller,
    initializer,
    addDaysToEVM,
    NFTDummyContract,
    dummyOptionRequest,
    publishDummyOptionRequest,
} from "../src/utils/backend";
import {SECONDS_IN_A_DAY} from "../src/utils/constants";
import {NFTOptContract} from "../src/utils/deployment";

let optionAmerican: any;
let optionEuropean: any;

describe("exerciseOption", function () {
    beforeEach("create_option_for_exercise", async function () {
        await initializer();

        // Publish American option
        await NFTOptContract.connect(buyer).publishOptionRequest(
            dummyOptionRequest.nftContract,
            dummyOptionRequest.nftId,
            dummyOptionRequest.strikePrice,
            dummyOptionRequest.interval,
            OptionFlavor.AMERICAN,
            {value: dummyOptionRequest.premium}
        );

        // Publish European option
        await NFTOptContract.connect(buyer).publishOptionRequest(
            dummyOptionRequest.nftContract,
            3,
            dummyOptionRequest.strikePrice,
            dummyOptionRequest.interval,
            dummyOptionRequest.flavor,
            {value: dummyOptionRequest.premium}
        );

        await publishDummyOptionRequest();

        // Fill option requests
        await NFTOptContract.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice});
        await NFTOptContract.connect(seller).createOption(2, {value: dummyOptionRequest.strikePrice});

        // Load option details -- TODO: store as Option struct; need to transform, as Solidity returns tuples
        optionAmerican = await NFTOptContract.options(1);
        optionEuropean = await NFTOptContract.options(2);
    });

    it("reverts with non-existent optionID", async function () {
        await expect(NFTOptContract.connect(buyer).exerciseOption(9999)).to.be.revertedWith("INVALID_OPTION_ID");
    });

    it("reverts when msg.sender isn't the buyer", async function () {
        await expect(NFTOptContract.connect(seller).exerciseOption(1)).to.be.revertedWith("NOT_AUTHORIZED");
    });

    it("reverts when buyer isn't the owner of option NFT after option is in effect", async function () {
        // Transfer NFT from buyer to seller
        await NFTDummyContract.connect(buyer).transferFrom(buyer.address, seller.address, optionAmerican.nftId);

        // Exercise option
        await expect(NFTOptContract.connect(buyer).exerciseOption(1)).to.be.revertedWith("NFT_NOT_OWNER");
    });

    it("reverts when option state is not OPEN", async function () {
        await expect(NFTOptContract.connect(buyer).exerciseOption(3)).to.be.revertedWith("INVALID_OPTION_STATE");
    });

    it("fails when contract address is not approved to transfer NFT", async function () {
        await expect(NFTOptContract.connect(buyer).exerciseOption(1)).to.be.revertedWith(
            "NOT_APPROVED_TO_TRANSFER_NFT"
        );
    });

    it("succeeds when contract address is approved to transfer NFT", async function () {
        // Approve contract to transfer NFT
        await NFTDummyContract.connect(buyer).approve(NFTOptContract.address, dummyOptionRequest.nftId);

        // Exercise option
        await expect(NFTOptContract.connect(buyer).exerciseOption(1)).to.emit(NFTOptContract, "Exercised").withArgs(1);
    });

    it("fails when european option is exercised before the expiration day", async function () {
        // Approve contract to transfer NFT
        await NFTDummyContract.connect(buyer).approve(NFTOptContract.address, optionEuropean.nftId);

        // Exercise option
        await expect(NFTOptContract.connect(buyer).exerciseOption(2)).to.be.revertedWith("EXERCISE_WINDOW_IS_CLOSED");
    });

    it("succeeds when european option is exercised on expiration day", async function () {
        // Approve contract to transfer NFT
        await NFTDummyContract.connect(buyer).approve(NFTOptContract.address, optionEuropean.nftId);

        // Fast-foward EVM by interval - 1 day (to the day of exercise)
        await addDaysToEVM(dummyOptionRequest.interval / SECONDS_IN_A_DAY - 1);

        // Exercise option
        await expect(NFTOptContract.connect(buyer).exerciseOption(2)).to.emit(NFTOptContract, "Exercised").withArgs(2);
    });

    it("succeeds when american option is exercised on expiration day", async function () {
        // Approve contract to transfer NFT
        await NFTDummyContract.connect(buyer).approve(NFTOptContract.address, optionAmerican.nftId);

        // Fast-foward EVM by 2 days
        await addDaysToEVM(2);

        // Exercise option
        await expect(NFTOptContract.connect(buyer).exerciseOption(1)).to.emit(NFTOptContract, "Exercised").withArgs(1);
    });

    it("succeeds when exercised and buyer's ETH balance has increased by strike price", async function () {
        // Approve contract to transfer NFT
        await NFTDummyContract.connect(buyer).approve(NFTOptContract.address, optionAmerican.nftId);

        let buyerBalance0 = await buyer.getBalance();

        // Exercise option (promise)
        let tx = NFTOptContract.connect(buyer).exerciseOption(1);

        // Exercise option
        await expect(tx).to.emit(NFTOptContract, "Exercised").withArgs(1);

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
        const option = await NFTOptContract.options(id);

        // Approve contract to transfer NFT
        await NFTDummyContract.connect(buyer).approve(NFTOptContract.address, option.nftId);

        // Exercise option
        await expect(NFTOptContract.connect(buyer).exerciseOption(id))
            .to.emit(NFTOptContract, "Exercised")
            .withArgs(id);

        // Check NFT ownership
        let owner = await NFTDummyContract.ownerOf(option.nftId);
        expect(owner).to.equal(seller.address);
    });
});
