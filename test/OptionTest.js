const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Option", function ()
{
    let owner
      , account1
      , account2;

    beforeEach
    (
        "deploy contract",
        async () =>
        {
            const accounts = await ethers.getSigners();

            owner    = accounts[0];
            account1 = accounts[1];
            account2 = accounts[2];

            const Option = await ethers.getContractFactory("Option");
            optionCTR = await Option.deploy();
            await optionCTR.deployed();
        }
    );

    describe("sayHello", function ()
    {
        it("creates an option", async function ()
        {
            await optionCTR.connect(account1).createOption();

            expect (await optionCTR.connect(account1).getBuyer()).to.equal(account1.address);
        });

        it("creates collateral", async function ()
        {
            await optionCTR.connect(account2).createCollateral();

            expect (await optionCTR.connect(account2).getSeller()).to.equal(account2.address);
        });
    });
})