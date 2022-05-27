import { expect } from "chai";
import { addressEmpty } from "../src/utils/constants"
import { OptionFlavor, OptionState } from "../src/utils/types"
import {
    buyer,
    seller,
    initializer,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
} from "../src/utils/backend";

beforeEach("deploy contract", async () => {
    await initializer();
});

describe("withdrawOptionRequest", function () {
    it("tests that method can be called", async function () {
        expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
    });
});