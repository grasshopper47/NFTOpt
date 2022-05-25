import { expect } from "chai";
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

        it("should fail when option is not in REQUEST state", async function () {
            const option = await NFTOptCTR.options(1);
            expect(option.state).to.equal(OptionState.Request);
        });

        it("should fail when caller is not the buyer", async function () {
            await publishDummyOptionRequest();
            const option = await NFTOptCTR.options(1);
            expect(option.buyer).to.equal(dummyOptionRequest.buyer);
        });
    });
});
