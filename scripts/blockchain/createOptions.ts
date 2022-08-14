import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import { ethers } from "hardhat";
import { NFTOpt } from "../../typechain-types";
import { ADDRESS0 } from "../../utils/constants";
import { OptionState } from "../../models/enums";

async function createOptions()
{
    const signers = await ethers.getSigners();

    // remove 1st account, it's the one that created all the options
    signers.shift();

    // Create completely new instance with the default provider (readonly)
    const NFTOpt =
    new ethers.Contract
    (
        addresses.localhost.NFTOpt
    ,   NFTOptSolContract.abi
    ,   signers[0].provider
    ) as NFTOpt;

    let i = 0;
    let max = 9;

    console.log(`Fulfilling ${max + 1} options ...`);

    let optionID = await NFTOpt.optionID();

    if (!optionID)
    {
        console.log("Missing options to fulfill!");

        return;
    }

    while (i !== max)
    {
        if (optionID.lt(1)) break;

        let option = await NFTOpt.options(optionID);

        if (option.buyer === ADDRESS0 || option.state === OptionState.OPEN)
        {
            optionID = optionID.sub(1);
            continue;
        }

        NFTOpt.connect(signers[Math.floor(Math.random() * signers.length)]).createOption
        (
            optionID
        ,   {
                value: option.strikePrice
            ,   gasLimit: 500_000
            }
        );

        console.log("Fulfilled " + optionID);

        ++i;
        optionID = optionID.sub(1);
    }

    let option = await NFTOpt.options(optionID);

    while (option.buyer === ADDRESS0 || option.state === OptionState.OPEN)
    {
        optionID = optionID.sub(1);

        if (optionID.lt(0)) break;

        option = await NFTOpt.options(optionID);
    }

    if (optionID.gt(-1))
    {
        await NFTOpt.connect(signers[Math.floor(Math.random() * signers.length)]).createOption
        (
            optionID
        ,   {
                value: option.strikePrice
            ,   gasLimit: 500_000
            }
        );

        console.log("Fulfilled " + optionID);
    }

    console.log("Done");
}

createOptions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
