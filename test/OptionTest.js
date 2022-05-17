const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Option", function ()
{
    let owner;
    let account1;

    beforeEach
    (
        "deploy contract",
        async () =>
        {
            const accounts = await ethers.getSigners();

            owner    = accounts[0];
            account1 = accounts[1];

            const Option = await ethers.getContractFactory("Option");
            optionCTR = await Option.deploy();
            await optionCTR.deployed();
        }
    );

    describe("sayHello", function ()
    {
        it("says hello", async function ()
        {
            expect(await optionCTR.connect(owner).sayHello()).to.equal("Hello World");
        });

        it("won't say hello", async function ()
        {
            await expect(
                optionCTR.connect(account1).sayHello()
            ).to.be.revertedWith("Not an owner");
        });
    });
})