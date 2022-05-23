import {expect} from "chai";
import {
    address0,
    buyer,
    contractInitializer,
    dummyOptionRequest,
    increaseEVMTimestampBy,
    NFTDummyCTR,
    NFTOptCTR,
    OptionFlavor,
    OptionState,
    publishDummyOptionRequest,
    seller,
} from "./utils";

describe("NFTOpt Tests", function () {
    beforeEach("deploy contract", async () => {
        await contractInitializer();
    });

    describe("withdrawOptionRequest", function () {
        it("should test that method can be called", async function () {
            expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
        });
    });
});
