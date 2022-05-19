import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Option", function () {
  let owner: SignerWithAddress;
  let account1: SignerWithAddress;
  let account2: SignerWithAddress;
  let optionCTR: Contract;

  beforeEach("deploy contract", async () => {
    const accounts = await ethers.getSigners();

    owner = accounts[0];
    account1 = accounts[1];
    account2 = accounts[2];

    const Option = await ethers.getContractFactory("Option");
    optionCTR = await Option.deploy();
    await optionCTR.deployed();
  });

  describe("first basic test", function () {
    it("creates an option", async function () {
      await optionCTR.connect(account1).createOption();

      expect(await optionCTR.connect(account1).getBuyer()).to.equal(
        account1.address
      );
    });

    it("creates collateral", async function () {
      await optionCTR.connect(account2).createCollateral();

      expect(await optionCTR.connect(account2).getSeller()).to.equal(
        account2.address
      );
    });
  });
});
