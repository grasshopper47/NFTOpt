import { expect } from "chai";
import { OptionState } from "../../models/enums";
import {
    buyer,
    seller,
    thirdParty,
    addDaysToEVM,
    initializer,
    NFTDummyContract,
    dummyOptionRequest,
    publishDummyRequest
} from "../helpers";
import { SECONDS_IN_A_DAY } from "../../utils/constants";
import { deployNFTOptContract, NFTOptContract } from "../../utils/deployment/NFTOpt";

describe("cancelOption", function () {
    before("prepareEnv", async function () {
        await initializer();
    });

    it("reverts with non-existent optionID", async function () {
        await expect(NFTOptContract.connect(buyer)
            .cancelOption(9999))
            .to.be.revertedWith("INVALID_ID");
    });

    it("reverts when option has already been exercised", async function () {
        await publishDummyRequest();

        // Fill option
        expect(
            await NFTOptContract
            .connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice })
        ).to.not.throw;

        // Fast-foward EVM by exercise date (interval 6 days) for european contract
        await addDaysToEVM(dummyOptionRequest.interval / SECONDS_IN_A_DAY - 1);

        // Approve contract for transferring NFT
        expect(
            await NFTDummyContract
            .connect(buyer)
            .approve(NFTOptContract.address, dummyOptionRequest.nftId)
        ).to.not.throw;

        // Exercise option
        expect(
            await NFTOptContract.connect(buyer).exerciseOption(0)
        ).to.not.throw;

        const option = await NFTOptContract.connect(buyer).options(0);
        expect(option.state).to.equal(OptionState.EXERCISED);

        await expect(
            NFTOptContract.connect(buyer).cancelOption(0)
        ).to.be.revertedWith("INVALID_OPTION_STATE");

        // Reset the state
        await deployNFTOptContract();
        await NFTDummyContract.connect(seller).transferFrom(seller.address, buyer.address, 1);
    });

    it("reverts when non-participant tries to cancel", async function () {
        await publishDummyRequest();

        // Fill option
        await expect(
            NFTOptContract
            .connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice })
        ).to.not.throw;

        // Fast-foward EVM by 2 days
        await addDaysToEVM(2);

        // Try to cancel
        await expect(
            NFTOptContract.connect(seller).cancelOption(0)
        ).to.be.revertedWith("NOT_AUTHORIZED");

        // Fast-foward EVM by interval + 1 days
        await addDaysToEVM(dummyOptionRequest.interval / SECONDS_IN_A_DAY + 1);

        // Try to cancel again, by non-participant
        await expect(
            NFTOptContract.connect(thirdParty).cancelOption(0)
        ).to.be.revertedWith("NOT_AUTHORIZED");

        // Reset the state
        await deployNFTOptContract();
    });

    it("succeeds when called by seller after expiration date", async function () {
        await publishDummyRequest();

        // Fill option
        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened")
            .withArgs(0);

        // Try to cancel
        await expect(NFTOptContract.connect(seller)
            .cancelOption(0))
            .to.be.revertedWith("NOT_AUTHORIZED");

        // Fast-foward EVM by interval + 1 days
        await addDaysToEVM(dummyOptionRequest.interval / SECONDS_IN_A_DAY + 1);

        // Should be allowed to cancel when option is expired
        await expect(NFTOptContract.connect(seller).cancelOption(0))
            .to.emit(NFTOptContract, "Canceled")
            .withArgs(0);

        // Reset the state
        await deployNFTOptContract();
    });

    it("succeeds when called by buyer within specified interval", async function () {
        await publishDummyRequest();

        // Fill option
        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened")
            .withArgs(0);

        // Fast-foward EVM by 2 days; before expiry
        await addDaysToEVM(2);

        await expect(NFTOptContract.connect(buyer)
            .cancelOption(0))
            .to.emit(NFTOptContract, "Canceled")
            .withArgs(0);

        // Reset the state
        await deployNFTOptContract();
    });

    it("sends the collateral back to the seller", async function () {
        await publishDummyRequest();

        // Fill option
        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened")
            .withArgs(0);

        const sellerBalance0 = await seller.getBalance();

        // Cancel the option
        await expect(NFTOptContract.connect(buyer)
            .cancelOption(0))
            .to.emit(NFTOptContract, "Canceled")
            .withArgs(0);

        // Check seller receives collateral
        let sellerBalance1 = await seller.getBalance();
        sellerBalance1 = sellerBalance1.sub(dummyOptionRequest.strikePrice);
        expect(sellerBalance0).to.equal(sellerBalance1);

        // Reset the state
        await deployNFTOptContract();
    });

    it("emits 'Canceled' event", async function () {
        await publishDummyRequest();

        // Fill option
        await expect(NFTOptContract.connect(seller)
            .createOption(0, { value: dummyOptionRequest.strikePrice }))
            .to.emit(NFTOptContract, "Opened")
            .withArgs(0);

        // Cancel the option
        await expect(NFTOptContract.connect(buyer).cancelOption(0))
            .to.emit(NFTOptContract, "Canceled")
            .withArgs(0);

        let cancelledOption = await NFTOptContract.connect(buyer).options(0);
        expect(cancelledOption.state).to.equal(OptionState.CANCELED);

        // Reset the state
        await deployNFTOptContract();
    });

    it("prints gas limit", async function () {
        await publishDummyRequest();

        // Fill option
        expect(
            await NFTOptContract.connect(seller).createOption(0, { value: dummyOptionRequest.strikePrice })
        ).to.not.throw;

            // Cancel the option
        const currentGas = (await NFTOptContract.connect(buyer).estimateGas.cancelOption(0)).toNumber();

        console.log(currentGas);
    });
});
