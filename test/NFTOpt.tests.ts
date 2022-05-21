import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, ContractTransaction } from "ethers";
import { ethers } from "hardhat";
import { NFTOpt, DummyNFT } from "../typechain-types";

describe("NFTOpt Tests", function () {

    const address0 : string = "0x0000000000000000000000000000000000000000";

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
    let publishDummyOptionRequest: () => Promise<void>;

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
        NFTDummyCTR = await NFT.deploy("NFT_NAME","NFT_SYMBOL", buyer.address);
        await NFTDummyCTR.deployed();

        dummyOptionRequest =
        {
            buyer       : buyer.address
        ,   seller      : address0
        ,   nftContract : NFTDummyCTR.address
        ,   nftId       : 101
        ,   startDate   : 0
        ,   interval    : 7
        ,   premium     : ethers.utils.parseEther("1")
        ,   strikePrice : ethers.utils.parseEther("50")
        ,   flavor      : 0
        ,   state       : 0 // = REQUEST
        }

        publishDummyOptionRequest = () => {
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
    });

    describe("publishOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer)
                            .publishOptionRequest(buyer.address,0,0,0,0)).to.not.throw;
        });

        it("should fail when called with address(0) as NFT Contract Address", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(address0,0,0,0,0)
            ).to.be.revertedWith("NFT contract must be a valid address");
        });

        it("should fail when called with 0 as NFT Token ID", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(buyer.address,0,0,0,0)
            ).to.be.revertedWith("NFT token ID must be > 0");
        });

        it("should fail when called with an invalid (non ERC-721 compliant) NFT Contract", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(buyer.address,1,0,0,0)
            ).to.be.revertedWith("Provided NFT contract address must implement ERC-721 interface");
        });

        it("should fail when NFT Token ID is under different ownership than the caller's", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,25,0,0,0)
            ).to.be.revertedWith("Ownership of specified NFT token is under a different wallet than the caller's");
        });

        it("should fail when called without a premium (transaction value)", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,1,0,0,0)
            ).to.be.revertedWith("Premium must be > 0");
        });

        it("should fail when called with 0 as Strike Price", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,1,0,0,0,{ value: 1 })
            ).to.be.revertedWith("Strike price must be > 0");
        });

        it("should fail when called with 0 as Interval", async function () {
            await expect(
                NFTOptCTR.connect(buyer)
                         .publishOptionRequest(NFTDummyCTR.address,1,1,0,0,{ value: 1 })
            ).to.be.revertedWith("Expiration interval must be > 0");
        });

        it("should succeed when called with valid values", async function () {

            expect( await NFTOptCTR.getBalance() ).to.equal(0);
            expect( await NFTOptCTR.optionID() ).to.equal(0);

            await expect(
               NFTOptCTR.connect(buyer)
                         .publishOptionRequest
                         (
                             dummyOptionRequest.nftContract
                         ,   dummyOptionRequest.nftId
                         ,   dummyOptionRequest.strikePrice
                         ,   dummyOptionRequest.interval
                         ,   dummyOptionRequest.flavor
                         ,  { value: dummyOptionRequest.premium }
                         )
            ).to.not.be.reverted;

            expect( await NFTOptCTR.getBalance() ).to.equal(dummyOptionRequest.premium);
            expect( await NFTOptCTR.optionID() ).to.equal(1);

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
                         ,   dummyOptionRequest.nftId
                         ,   dummyOptionRequest.strikePrice
                         ,   dummyOptionRequest.interval
                         ,   dummyOptionRequest.flavor
                         ,  { value: dummyOptionRequest.premium }
                         )
            ).to.emit(NFTOptCTR, "NewRequest").withArgs(buyer.address, 1);
        });
     });

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
        });
    });

    describe("createOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).createOption(0)).to.not.throw;
        });

        it("should fail when the option with the specified id does not exist", async function () {
            await expect(
                NFTOptCTR.connect(seller).createOption(0)
            ).to.be.revertedWith("Option with the specified id does not exist");
        });

        it("should fail when the option is already fulfilled by a seller", async function () {
            await publishDummyOptionRequest();

            await expect(
                NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})
            ).to.not.reverted;

            await expect(
                NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})
            ).to.be.revertedWith("Option is already fulfilled by a seller");
        });

        it("should fail when the option is not in the request state", async function () {
            await publishDummyOptionRequest();

            await expect(
                NFTOptCTR.connect(buyer).withdrawOptionRequest(1)
            ).to.not.be.reverted;

            await expect(
                NFTOptCTR.connect(seller).createOption(1)
            ).to.be.revertedWith("Option is not in the request state");
        });

        it("should fail when the option seller is the same as the option buyer", async function () {
            await publishDummyOptionRequest();

            await expect(
                NFTOptCTR.connect(buyer).createOption(1)
            ).to.be.revertedWith("Seller is the same as buyer");
        });

        it("should fail when the option seller does not have enough balance", async function () {
            const balanceGreaterThanSeller = (await seller.getBalance()).add(1);

            await expect(
                NFTOptCTR.connect(buyer).publishOptionRequest(
                    dummyOptionRequest.nftContract,
                    dummyOptionRequest.nftId,
                    balanceGreaterThanSeller,
                    dummyOptionRequest.interval,
                    dummyOptionRequest.flavor,
                    {value: dummyOptionRequest.premium}
                )
            ).to.not.be.reverted;

            await expect(
                NFTOptCTR.connect(seller).createOption(1)
            ).to.be.revertedWith("Seller does not have enough balance");
        });

        it("should fail when the wrong strike price is provided by the seller", async function () {
            await publishDummyOptionRequest();

            await expect(
                NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice.sub(1)})
            ).to.be.revertedWith("Wrong strike price provided");
        });

        it("should succeed when called with valid values", async function () {
            const initialSellerBalance = await seller.getBalance();

            expect(await NFTOptCTR.getBalance()).to.equal(0);

            await publishDummyOptionRequest();

            expect(await NFTOptCTR.getBalance()).to.equal(dummyOptionRequest.premium);

            const transaction = (await expect(NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})).to.not.be.reverted) as unknown as ContractTransaction;

            // Check that the collateral was paid
            expect(await NFTOptCTR.getBalance()).to.equal(dummyOptionRequest.strikePrice);

            const updatedOption = await NFTOptCTR.connect(seller).options(1);

            // Check that the option startDate was updated
            expect(updatedOption.startDate).to.not.equal(0);

            // // Check that the option seller address was updated
            expect(updatedOption.seller).to.equal(seller.address);

            // Check that the option state was updated to Open
            expect(updatedOption.state).to.equal(OptionState.Open);

            // Check that the seller's new balance is equal with the initial balance - gas used in transaction + premium - strikePrice
            const gasUsed = (await transaction.wait()).gasUsed;
            const gasPrice = transaction.gasPrice;
            const gasUsedInTransaction = gasUsed.mul(gasPrice ?? 0);

            expect(
                await seller.getBalance())
            .to.equal(
                initialSellerBalance.sub(gasUsedInTransaction)
                                    .add(updatedOption.premium)
                                    .sub(dummyOptionRequest.strikePrice)
            );
        });

        it("should emit Filled event when succeeded", async function () {
            await publishDummyOptionRequest();

            await expect(
                NFTOptCTR.connect(seller).createOption(1, {value: dummyOptionRequest.strikePrice})
            ).to.emit(NFTOptCTR, "Filled").withArgs(seller.address, 1);
        });
    });

    describe("cancelOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).cancelOption(0)).to.not.throw;
        });
    });

    describe("exerciseOption", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).exerciseOption(0)).to.not.throw;
        });
    });
});
