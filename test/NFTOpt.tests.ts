import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { NFTOpt, DummyNFT } from "../typechain-types";

async function increaseEVMTimestampBy(days: number) {
    const numberOfDays = days * 24 * 60 * 60;

    // @ts-ignore
    await ethers.provider.send('evm_increaseTime', [numberOfDays]);

    // @ts-ignore
    await ethers.provider.send('evm_mine');
}

describe("NFTOpt Tests", function () {

    const address0: string = "0x0000000000000000000000000000000000000000";

    let buyer: SignerWithAddress;
    let seller: SignerWithAddress;
    let NFTOptCTR: NFTOpt;
    let NFTDummyCTR: DummyNFT;

    interface Option {
        buyer: string;
        seller: string;
        nftContract: string;
        nftId: number;
        startDate: number;
        interval: number;
        premium: BigNumber;
        strikePrice: BigNumber;
        flavor: number;
        state: number;
    }

    const OptionState = {
        Request: 0,
        Open: 1,
        Closed: 2,
    }

    const OptionFlavor = {
        European: 0,
        American: 1,
    }

    let dummyOptionRequest: Option;

    let publishDummyOptionRequest = async () =>
     {
        return expect(
            NFTOptCTR.connect(buyer).publishOptionRequest(
                dummyOptionRequest.nftContract
            ,   dummyOptionRequest.nftId
            ,   dummyOptionRequest.strikePrice
            ,   dummyOptionRequest.interval
            ,   dummyOptionRequest.flavor
            ,  { value: dummyOptionRequest.premium }
            )
        ).to.not.be.reverted;
    }

    beforeEach("deploy contract", async () => {
        const accounts = await ethers.getSigners();

        buyer = accounts[0];
        seller = accounts[1];

        // Deploy APP contract
        const NFTOpt = await ethers.getContractFactory("NFTOpt");
        NFTOptCTR = await NFTOpt.deploy();
        await NFTOptCTR.deployed();

        // Deploy dummy NFT contract and mint 20 nfts to buyer
        const NFT = await ethers.getContractFactory("DummyNFT");
        NFTDummyCTR = await NFT.deploy(buyer.address);
        await NFTDummyCTR.deployed();

        dummyOptionRequest =
        {
            buyer       : buyer.address
        ,   seller      : address0
        ,   nftContract : NFTDummyCTR.address
        ,   nftId       : 10
        ,   startDate   : 0
        ,   interval    : 7 * 24 * 60 * 60  //  7 days
        ,   premium     : ethers.utils.parseEther("1")
        ,   strikePrice : ethers.utils.parseEther("50")
        ,   flavor      : OptionFlavor.European
        ,   state       : OptionState.Request
        }
    });

    describe("publishOptionRequest", function () {
        it("should fail when called with address(0) as NFT Contract Address", async function () {
            await expect(NFTOptCTR.connect(buyer)
                            .publishOptionRequest(address0, 0, 0, 0, 0))
                  .to.be.revertedWith("NFT contract must be a valid address");
        });

        it("should fail when called with 0 as NFT Token ID", async function () {
            await expect(NFTOptCTR.connect(buyer)
                                  .publishOptionRequest(buyer.address, 0, 0, 0, 0))
                  .to.be.revertedWith("NFT token ID must be > 0");
        });

        it("should fail when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
            await expect(NFTOptCTR.connect(buyer)
                                  .publishOptionRequest(buyer.address, 1, 0, 0, 0))
                  .to.be.revertedWith("Provided NFT contract address must implement ERC-721 interface");
        });

        it("should fail when NFT Token ID is under different ownership than the caller's", async function () {
            // Send NFT ID 3 to seller
            let _nftID = 3
            await NFTDummyCTR.connect(buyer)
                             .transferFrom(buyer.address, seller.address, _nftID);

            expect(await NFTDummyCTR.ownerOf(_nftID))
            .to.be.equal(seller.address);

            await expect(NFTOptCTR.connect(buyer)
                                  .publishOptionRequest(NFTDummyCTR.address, _nftID, 0, 0, 0))
                  .to.be.revertedWith("NOT_NFT_OWNER");
        });

        it("should fail when called without a premium (transaction value)", async function () {
            await expect(NFTOptCTR.connect(buyer)
                                  .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0))
                  .to.be.revertedWith("Premium must be > 0");
        });

        it("should fail when called with 0 as Strike Price", async function () {
            await expect(NFTOptCTR.connect(buyer)
                                  .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0, {value: 1}))
                  .to.be.revertedWith("Strike price must be > 0");
        });

        it("should fail when called with 0 as Interval", async function () {
            await expect( NFTOptCTR.connect(buyer)
                                  .publishOptionRequest(NFTDummyCTR.address, 1, 1, 0, 0, {value: 1}))
                  .to.be.revertedWith("Expiration interval must be > 0");
        });

        it("should succeed when called with valid values", async function () {
            expect(await NFTOptCTR.getBalance()).to.equal(0);
            expect(await NFTOptCTR.optionID()).to.equal(0);

            await publishDummyOptionRequest();

            expect(await NFTOptCTR.getBalance()).to.equal(dummyOptionRequest.premium);
            expect(await NFTOptCTR.optionID()).to.equal(1);

            // Check that details of the option data match those sent
            const option = await NFTOptCTR.options(1);

            expect(option.buyer).to.equal(dummyOptionRequest.buyer);
            expect(option.seller).to.equal(dummyOptionRequest.seller);
            expect(option.nftContract).to.equal(dummyOptionRequest.nftContract);
            expect(option.nftId).to.equal(dummyOptionRequest.nftId);
            expect(option.startDate).to.equal(dummyOptionRequest.startDate);
            expect(option.interval).to.equal(dummyOptionRequest.interval);
            expect(option.premium).to.equal(dummyOptionRequest.premium);
            expect(option.strikePrice).to.equal(dummyOptionRequest.strikePrice);
            expect(option.flavor).to.equal(dummyOptionRequest.flavor);
            expect(option.state).to.equal(dummyOptionRequest.state);
        });

        it("should emit NewRequest event when succeeded", async function () {
            await expect(publishDummyOptionRequest())
                  .to.emit(NFTOptCTR, "NewRequest")
                  .withArgs(buyer.address, 1);
        });
    });

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer)
                            .withdrawOptionRequest(0))
            .to.not.throw;
        })
    });

    describe("createOption", function () {
        it("should fail when the option with the specified id does not exist", async function () {
            await expect(NFTOptCTR.connect(seller)
                                  .createOption(0))
                  .to.be.revertedWith("Option with the specified id does not exist");
        });

        it("should fail when the option is already fulfilled by a seller", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller)
                                  .createOption(1, {value: dummyOptionRequest.strikePrice}))
                  .to.not.reverted;

            await expect(NFTOptCTR.connect(seller)
                                  .createOption(1, {value: dummyOptionRequest.strikePrice}))
                  .to.be.revertedWith("Option is already fulfilled by a seller");
        });

        it("should fail when the option is not in the request state", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(buyer)
                                  .withdrawOptionRequest(1))
                  .to.not.be.reverted;

            await expect(NFTOptCTR.connect(seller)
                                  .createOption(1))
                  .to.be.revertedWith("Option is not in the request state");
        });

        it("should fail when the option seller is the same as the option buyer", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(buyer)
                                  .createOption(1))
                  .to.be.revertedWith("Seller is the same as buyer");
        });

        it("should fail when the wrong strike price is provided by the seller", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller)
                                  .createOption(1, {value: dummyOptionRequest.strikePrice.sub(1)}))
                  .to.be.revertedWith("Wrong strike price provided");
        });

        it("should succeed when called with valid values", async function () {
            const initialSellerBalance = await seller.getBalance();

            expect(await NFTOptCTR.getBalance()).to.equal(0);

            await publishDummyOptionRequest();

            expect(await NFTOptCTR.getBalance())
            .to.equal(dummyOptionRequest.premium);

            // Seller responds to request and creates an option
            let tx = NFTOptCTR.connect(seller)
                              .createOption(1, {value: dummyOptionRequest.strikePrice});

            expect(tx).to.not.be.reverted;

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // Check that the collateral was paid
            expect(await NFTOptCTR.getBalance())
            .to.equal(dummyOptionRequest.strikePrice);

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

            expect(await seller.getBalance())
            .to.equal(initialSellerBalance.add(updatedOption.premium)
                                          .sub(dummyOptionRequest.strikePrice)
                                          .sub(gasUsedInTransaction));
        });

        it("should emit Filled event when succeeded", async function () {
            await publishDummyOptionRequest();

            await expect( NFTOptCTR.connect(seller)
                                   .createOption(1, {value: dummyOptionRequest.strikePrice}))
                  .to.emit(NFTOptCTR, "Filled")
                  .withArgs(seller.address, 1);
        });
    });

    describe("cancelOption", function () {

        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).cancelOption(0)).to.not.throw;
        });

        it("should test that the option exists", async function () {

            expect(
                NFTOptCTR.connect(buyer).cancelOption(0)
                ).to.be.revertedWith("The Option does not exist");
        });

        it("should revert when the option does not have a start date i.e. published: REQUEST state", async function () {

            await NFTOptCTR.connect(buyer).publishOptionRequest
            (
                dummyOptionRequest.nftContract
            ,   dummyOptionRequest.nftId
            ,   dummyOptionRequest.strikePrice
            ,   dummyOptionRequest.interval
            ,   OptionFlavor.American
            ,   {value: dummyOptionRequest.premium}
            );

            var publishedOption = await NFTOptCTR.connect(buyer).options(1);
            expect(publishedOption.state).equals(OptionState.Request);

            expect(NFTOptCTR.connect(buyer).cancelOption(1)).
                                            to.be.revertedWith("The Option is not open");
        });

        it("should revert when option is NOT in OPEN state i.e. published: REQUEST or exercised/cancelled: CLOSED states", async function () {

            await NFTOptCTR.connect(buyer).publishOptionRequest
            (
                dummyOptionRequest.nftContract
            ,   dummyOptionRequest.nftId
            ,   dummyOptionRequest.strikePrice
            ,   dummyOptionRequest.interval
            ,   OptionFlavor.American
            ,   {value: dummyOptionRequest.premium}
            );

            // filled
            await NFTOptCTR.connect(seller).createOption(
                1, {value: dummyOptionRequest.strikePrice}
                );

            // exercised
            await NFTDummyCTR.connect(buyer).approve(
                NFTOptCTR.address, dummyOptionRequest.nftId
                );
            await NFTOptCTR.connect(buyer).exerciseOption(1);
            let exercisedOption = await NFTOptCTR.connect(buyer).options(1);
            expect(exercisedOption.state).equals(OptionState.Closed);

            expect(
                NFTOptCTR.connect(buyer).cancelOption(1)
                ).to.be.revertedWith("The Option is not open");

            // already canceled
            expect(
                NFTOptCTR.connect(buyer).cancelOption(1)
                ).to.be.revertedWith("The Option is not open");
        });

        it("should test seller is permitted to cancel only expired filled option", async function () {

            await NFTOptCTR.connect(buyer).publishOptionRequest
            (
                dummyOptionRequest.nftContract
            ,   dummyOptionRequest.nftId
            ,   dummyOptionRequest.strikePrice
            ,   dummyOptionRequest.interval
            ,   OptionFlavor.American
            ,   {value: dummyOptionRequest.premium}
            );

            // filled
            await NFTOptCTR.connect(seller).createOption(
                1, {value: dummyOptionRequest.strikePrice}
                );

            // Fast-foward EVM by 2 days
            await increaseEVMTimestampBy(2);

            expect(
                NFTOptCTR.connect(seller).cancelOption(1)
                ).to.be.revertedWith("Only Buyer can cancel");

            // Fast-foward EVM by 8 days
            await increaseEVMTimestampBy(8);

            expect(
                NFTOptCTR.connect(seller).cancelOption(1)
                ).to.not.throw;

        });

        it("should test buyer can cancel filled option at any time", async function () {

            await NFTOptCTR.connect(buyer).publishOptionRequest
            (
                dummyOptionRequest.nftContract
            ,   dummyOptionRequest.nftId
            ,   dummyOptionRequest.strikePrice
            ,   dummyOptionRequest.interval
            ,   OptionFlavor.American
            ,   {value: dummyOptionRequest.premium}
            );

            // filled
            await NFTOptCTR.connect(seller).createOption(
                1, {value: dummyOptionRequest.strikePrice}
                );

            var randomAccount = (await ethers.getSigners())[3];
            expect(
                NFTOptCTR.connect(randomAccount).cancelOption(1)
                ).to.be.revertedWith("Only Buyer or Seller can cancel");

            // Fast-foward EVM by 2 days; before expiry
            await increaseEVMTimestampBy(2);

            expect(
                NFTOptCTR.connect(buyer).cancelOption(1)
                ).to.not.throw;

        });

        it("should test the collateral (in contract) is transferred back to the seller", async function () {

            await NFTOptCTR.connect(buyer).publishOptionRequest
            (
                dummyOptionRequest.nftContract
            ,   dummyOptionRequest.nftId
            ,   dummyOptionRequest.strikePrice
            ,   dummyOptionRequest.interval
            ,   OptionFlavor.American
            ,   {value: dummyOptionRequest.premium}
            );

            await NFTOptCTR.connect(seller).createOption(
                1, {value: dummyOptionRequest.strikePrice}
                );

            const initialBuyerBalance = await buyer.getBalance();
            const initialSellerBalance = await seller.getBalance();

            // buyer cancels option
            let tx = NFTOptCTR.connect(buyer).cancelOption(1);
            expect(tx).to.not.be.reverted;

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // calculate gas costs
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            const updatedOption = await NFTOptCTR.connect(seller).options(1);
            // Check buyer incurs cancellation transaction costs
            expect(await buyer.getBalance())
            .to.equal(initialBuyerBalance.sub(gasUsedInTransaction));

            // Check seller receives collateral
            expect(await seller.getBalance())
            .to.equal(initialSellerBalance.add(dummyOptionRequest.strikePrice));

        });

        it("should emit Canceled event when succeeded", async function () {
            await publishDummyOptionRequest();

            await NFTOptCTR.connect(seller).createOption(
                1, {value: dummyOptionRequest.strikePrice}
                );

            await expect(NFTOptCTR.connect(buyer).cancelOption(1))
                  .to.emit(NFTOptCTR, "Canceled")
                  .withArgs(buyer.address, 1);

            let cancelledOption = await NFTOptCTR.connect(buyer).options(1);
            expect(cancelledOption.state).equals(OptionState.Closed)

        });

    });

    describe("exerciseOption", function () {
        beforeEach("create_option_for_exercise", async function () {
            // Publish American option
            await NFTOptCTR.connect(buyer)
                           .publishOptionRequest
                           (
                               dummyOptionRequest.nftContract
                           ,   dummyOptionRequest.nftId
                           ,   dummyOptionRequest.strikePrice
                           ,   dummyOptionRequest.interval
                           ,   OptionFlavor.American
                           ,   {value: dummyOptionRequest.premium}
                           );

            // Publish European option
            await NFTOptCTR.connect(buyer)
                           .publishOptionRequest
                           (
                               dummyOptionRequest.nftContract
                           ,   17
                           ,   dummyOptionRequest.strikePrice
                           ,   dummyOptionRequest.interval
                           ,   dummyOptionRequest.flavor
                           ,   {value: dummyOptionRequest.premium}
                           );

            // Fill option ID 1 (American)
            await NFTOptCTR.connect(seller)
                           .createOption(1, {value: dummyOptionRequest.strikePrice});
        });

        it("should revert with non-existent optionID", async function () {
            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(9999))
                  .to.be.revertedWith('INVALID_OPTION_ID');
        });

        it("only option buyer can execute", async function () {
            await expect(NFTOptCTR.connect(seller)
                                  .exerciseOption(1))
                  .to.be.revertedWith('NOT_AUTHORIZED');
        });

        it("Buyer must be owner of the NFT id", async function () {
            let option = await NFTOptCTR.options(2);

            // Fill option 2 so as not fail under different test
            await NFTOptCTR.connect(seller)
                           .createOption(2, {value: option.strikePrice});

            // Transfer NFT 17 to seller and then try to excercise
            await NFTDummyCTR.connect(buyer)
                             .transferFrom(buyer.address, seller.address, option.nftId);

            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(2))
                  .to.be.revertedWith("NOT_NFT_OWNER")
        });

        it("should revert with non-open options", async function () {
            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(2))
                  .to.be.revertedWith("INVALID_OPTION_STATE");
        });

        it("contract address must be approved to transfer NFT", async function () {
            // Try exercise without approval
            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(1))
                  .to.be.revertedWith("NFT_NOT_APPROVED");

            // Approve contract and try again
            await NFTDummyCTR.connect(buyer)
                             .approve(NFTOptCTR.address, dummyOptionRequest.nftId);

            expect(NFTOptCTR.connect(buyer.address)
                            .exerciseOption(1))
            .to.not.be.reverted;
        });


        it("european option should not be exercised before the expiration day", async function () {
            // Fill option ID 2 and approve contract for NFT
            const _optionID = 2;
            await NFTOptCTR.connect(seller)
                           .createOption(_optionID, {value: dummyOptionRequest.strikePrice});

            let europeanFilledOption = await NFTOptCTR.options(_optionID);

            await NFTDummyCTR.connect(buyer)
                             .approve(NFTOptCTR.address, europeanFilledOption.nftId);

            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(_optionID))
                  .to.be.revertedWith("EXERCISE_WINDOW_IS_CLOSED");

            // Fast-foward EVM by 6 days
            await increaseEVMTimestampBy(6);

            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(_optionID))
                  .to.emit(NFTOptCTR, "Exercised")
                  .withArgs(_optionID);
        });


        it("american option should be able to exercise before the expiration day", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);

            await NFTDummyCTR.connect(buyer)
                             .approve(NFTOptCTR.address, americanFilledOption.nftId);

            // Fast-foward EVM by 2 days
            await increaseEVMTimestampBy(2);

            await expect(NFTOptCTR.connect(buyer)
                                  .exerciseOption(_optionID))
                  .to.emit(NFTOptCTR, "Exercised")
                  .withArgs(_optionID);
        });

        it("Upon exercise, BUYER must have  increased his ETH balance by STRIKE_PRICE", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);

            await NFTDummyCTR.connect(buyer)
                             .approve(NFTOptCTR.address, americanFilledOption.nftId);

            let oldBuyerBalance = await buyer.getBalance();

            let tx = NFTOptCTR.connect(buyer)
                              .exerciseOption(_optionID);

            expect(tx)
            .to.emit(NFTOptCTR, "Exercised")
            .withArgs(_optionID);

            let transaction = await tx;
            let transactionReceipt = await transaction.wait();

            // Calculate gas costs
            const gasUsed = transactionReceipt.gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            // Check balance of option buyer
            expect(await buyer.getBalance())
            .to.be.equal(oldBuyerBalance.add(americanFilledOption.strikePrice)
                                        .sub(gasUsedInTransaction));
        });

        it("Upon exercise, SELLER must have ownership of NFT_ID", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);
            await NFTDummyCTR.connect(buyer)
                             .approve(NFTOptCTR.address, americanFilledOption.nftId);

            await expect(NFTOptCTR.connect(buyer).exerciseOption(_optionID))
                  .to.emit(NFTOptCTR, "Exercised")
                  .withArgs(_optionID);

            // Check NFT ownership
            expect(await NFTDummyCTR.ownerOf(americanFilledOption.nftId))
            .to.be.equal(seller.address)
        });
    });
});
