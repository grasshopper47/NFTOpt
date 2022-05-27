import { expect } from "chai";
import {
    address_empty,
    buyer,
    seller,
    initializer,
    NFTDummyCTR,
    NFTOptCTR,
    dummyOptionRequest,
    publishDummyOptionRequest,
    OptionFlavor,
    OptionState,
} from "./utils";

beforeEach("deploy contract", async () => {
    await initializer();
});

describe("withdrawOptionRequest", function () {
    it("tests that method can be called", async function () {
        expect(NFTOptCTR.connect(buyer).withdrawOptionRequest(0)).to.not.throw;
    });
});