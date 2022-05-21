import {SignerWithAddress} from "@nomiclabs/hardhat-ethers/signers";
import {expect} from "chai";
import {BigNumber} from "ethers";
import {ethers} from "hardhat";
import {NFTOpt, DummyNFT} from "../typechain-types";
import {beforeEach} from "mocha";

async function increaseEVMTimestampBy(days: number) {
    const numberOfDays = days * 24 * 60 * 60;
    const blockNumBefore = await ethers.provider.getBlockNumber();
    const blockBefore = await ethers.provider.getBlock(blockNumBefore);
    const timestampBefore = blockBefore.timestamp;

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

    let dummyOptionRequest: Option;

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
        NFTDummyCTR = await NFT.deploy("NFT_NAME", "NFT_SYMBOL", buyer.address);
        await NFTDummyCTR.deployed();

        dummyOptionRequest =
            {
                buyer: buyer.address
                , seller: address0
                , nftContract: NFTDummyCTR.address
                , nftId: 10
                , startDate: 0
                , interval: 7
                , premium: ethers.utils.parseEther("1")
                , strikePrice: ethers.utils.parseEther("50")
                , flavor: 0
                , state: 0 // = REQUEST
            }
    });

    describe("publishOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer)
                .publishOptionRequest(buyer.address, 0, 0, 0, 0)).to.not.throw;
        });

        it("should fail when called with address(0) as NFT Contract Address", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(address0, 0, 0, 0, 0)
            ).to.be.revertedWith("NFT contract must be a valid address");
        });

        it("should fail when called with 0 as NFT Token ID", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(buyer.address, 0, 0, 0, 0)
            ).to.be.revertedWith("NFT token ID must be > 0");
        });

        it("should fail when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(buyer.address, 1, 0, 0, 0)
            ).to.be.revertedWith("Provided NFT contract address must implement ERC-721 interface");
        });

        it("should fail when NFT Token ID is under different ownership than the caller's", async function () {
            // Send NFT ID 3 to seller
            let _nftID = 3
            let transfNftTX = await (await NFTDummyCTR.connect(buyer).transferFrom(buyer.address, seller.address, _nftID)).wait();
            await expect(await NFTDummyCTR.ownerOf(_nftID)).to.be.equal(seller.address);

            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(NFTDummyCTR.address, _nftID, 0, 0, 0)
            ).to.be.revertedWith("Ownership of specified NFT token is under a different wallet than the caller's");
        });

        it("should fail when called without a premium (transaction value)", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0)
            ).to.be.revertedWith("Premium must be > 0");
        });

        it("should fail when called with 0 as Strike Price", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(NFTDummyCTR.address, 1, 0, 0, 0, {value: 1})
            ).to.be.revertedWith("Strike price must be > 0");
        });

        it("should fail when called with 0 as Interval", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest(NFTDummyCTR.address, 1, 1, 0, 0, {value: 1})
            ).to.be.revertedWith("Expiration interval must be > 0");
        });

        it("should succeed when called with valid values", async function () {

            expect(await NFTOptCTR.getBalance()).to.equal(0);
            expect(await NFTOptCTR.optionID()).to.equal(0);

            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest
                    (
                        dummyOptionRequest.nftContract
                        , dummyOptionRequest.nftId
                        , dummyOptionRequest.strikePrice
                        , dummyOptionRequest.interval
                        , dummyOptionRequest.flavor
                        , {value: dummyOptionRequest.premium}
                    )
            ).to.not.be.reverted;

            expect(await NFTOptCTR.getBalance()).to.equal(dummyOptionRequest.premium);
            expect(await NFTOptCTR.optionID()).to.equal(1);

            // check details of the option data
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
            await expect(
                NFTOptCTR.connect(buyer)
                    .publishOptionRequest
                    (
                        dummyOptionRequest.nftContract
                        , dummyOptionRequest.nftId
                        , dummyOptionRequest.strikePrice
                        , dummyOptionRequest.interval
                        , dummyOptionRequest.flavor
                        , {value: dummyOptionRequest.premium}
                    )
            ).to.emit(NFTOptCTR, "NewRequest").withArgs(buyer.address, 1);
        });
    });

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
        })
    });

    describe("createOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).createOption(0)).to.not.throw;
        });
    });

    describe("cancelOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).cancelOption(0)).to.not.throw;
        });
    });

    describe("exerciseOption", function () {
        beforeEach("create_option_for_exercise", async function () {
            // Publish with wrong
            await NFTOptCTR.connect(buyer)
                .publishOptionRequest
                (
                    dummyOptionRequest.nftContract
                    , dummyOptionRequest.nftId
                    , dummyOptionRequest.strikePrice
                    , dummyOptionRequest.interval
                    , 1  // American
                    , {value: dummyOptionRequest.premium}
                );

            // Fill option ID 1
            await NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice});

            // Create second option unfilled
            await NFTOptCTR.connect(buyer)
                .publishOptionRequest
                (
                    dummyOptionRequest.nftContract
                    , 17
                    , dummyOptionRequest.strikePrice
                    , dummyOptionRequest.interval
                    , dummyOptionRequest.flavor
                    , {value: dummyOptionRequest.premium}
                );

        });

        it("should revert with non-existent optionID", async function () {
            let _invalidID = 9999;
            await expect(NFTOptCTR.connect(buyer).exerciseOption(_invalidID)).to.be.revertedWith('INVALID_OPTION_ID');
        });

        it("only option buyer can execute", async function () {
            await expect(NFTOptCTR.connect(seller).exerciseOption(1)).to.be.revertedWith('NOT_AUTHORIZED');
        });

        it("Buyer must be owner of the NFT id", async function () {
            let option = await NFTOptCTR.options(2);

            // Fill option 2 so as not fail under different test
            await NFTOptCTR.connect(seller).createOption(2);

            // Transfer NFT 17 to seller and then try to excercise
            let tx = await (await NFTDummyCTR.connect(buyer).transferFrom(buyer.address, seller.address, option.nftId)).wait()

            await expect(NFTOptCTR.connect(buyer).exerciseOption(2)).to.be
                .revertedWith("Ownership of specified NFT token is under a different wallet than the caller's")
        });

        it("should revert with non-open options", async function () {
            await expect(NFTOptCTR.connect(buyer).exerciseOption(2)).to.be.revertedWith("INVALID_OPTION_STATE");
        });

        it("contract address must be approved to transfer NFT", async function () {

            // Try exercise without approval
            expect(NFTOptCTR.connect(buyer).exerciseOption(1)).to.be
                .revertedWith("NFT_NOT_APPROVED")

            // Approve contract and try again
            let approval_tx = await (await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, dummyOptionRequest.nftId)).wait();
            expect(NFTOptCTR.connect(buyer.address).exerciseOption(1)).to.not.be.reverted;
        });


        it("european option should not be exercised before the expiration day", async function () {
            // Fill option ID 2 and approve contract for NFT
            const _optionID = 2;
            await NFTOptCTR.connect(seller).createOption(_optionID, {value: dummyOptionRequest.strikePrice});
            let europeanFilledOption = await NFTOptCTR.options(_optionID);
            let approval_tx = await (await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, europeanFilledOption.nftId)).wait();

            await expect(
                NFTOptCTR.connect(buyer).exerciseOption(_optionID)
            ).to.be.revertedWith("EXERCISE_WINDOW_IS_CLOSED");

            // Fast-foward EVM by 6 days
            await increaseEVMTimestampBy(6);

            await expect(
                NFTOptCTR.connect(buyer).exerciseOption(_optionID)
            ).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);
        });


        it("american option should be able to exercise before the expiration day", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);
            let approval_tx = await (await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, americanFilledOption.nftId)).wait();

            // Fast-foward EVM by 2 days
            await increaseEVMTimestampBy(2);

            await expect(
                NFTOptCTR.connect(buyer).exerciseOption(_optionID)
            ).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);
        });


        it("Upon exercise, BUYER must have  increased his ETH balance by STRIKE_PRICE", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);
            let approval_tx = await (await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, americanFilledOption.nftId)).wait();
            let oldBuyerBalance = await buyer.getBalance();

            // Execute
            await expect(
                NFTOptCTR.connect(buyer).exerciseOption(_optionID)
            ).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);

            // Check balance of option buyer
            await expect(await buyer.getBalance()).to.be.gt(oldBuyerBalance);
        });

        it("Upon exercise, SELLER must have ownership of NFT_ID", async function () {
            // Load option and approve contract for NFT
            const _optionID = 1;
            let americanFilledOption = await NFTOptCTR.options(_optionID);
            let approval_tx = await (await NFTDummyCTR.connect(buyer).approve(NFTOptCTR.address, americanFilledOption.nftId)).wait();

            //  Execute
            await expect(
                NFTOptCTR.connect(buyer).exerciseOption(_optionID)
            ).to.emit(NFTOptCTR, "Exercised").withArgs(_optionID);

            // Check NFT ownership
            await expect(await NFTDummyCTR.ownerOf(americanFilledOption.nftId)).to.be.equal(seller.address)
        });
    });

});
