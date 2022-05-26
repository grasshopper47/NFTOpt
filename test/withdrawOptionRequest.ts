import { expect } from "chai";
import { request } from "http";
import {
    address_empty,
    buyer,
    seller,
    contractInitializer,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
    OptionFlavor,
    OptionState,
} from "./utils";

describe("NFTOpt Tests", function () {
    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    describe("withdrawOptionRequest", function () {
        it("should fail when option does not exist", async function () {
            await expect(NFTOptCTR.connect(buyer)
                .withdrawOptionRequest(9999))
                .to.be.revertedWith("INVALID_OPTION_ID");
        });

        it("should fail when option not in REQUEST state", async function () {
            await publishDummyOptionRequest();

            // Fill option
            await expect(NFTOptCTR.connect(seller)
                .createOption(1, { value: dummyOptionRequest.strikePrice }))
                .to.emit(NFTOptCTR, "Filled");

            await expect(NFTOptCTR.connect(buyer)
                .withdrawOptionRequest(1))
                .to.be.revertedWith("INVALID_OPTION_STATE");
        });

        it("should fail when caller is not the buyer", async function () {
            await publishDummyOptionRequest();

            await expect(NFTOptCTR.connect(seller)
                .withdrawOptionRequest(1))
                .to.be.revertedWith("NOT_AUTHORIZED");
        });
    });
});
