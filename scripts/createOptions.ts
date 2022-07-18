import NFTOptSolContract from "../artifacts/contracts/NFTOpt.sol/NFTOpt.json";

import addresses from "../addresses.json";
import { ethers } from "hardhat";
import { NFTOpt } from "../typechain-types";
import { ADDRESS0 } from "../utils/constants";

export async function createOptions()
{
    const signers = await ethers.getSigners();

    // remove 1st account, it's the one that created all the requests
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
    let max = 10;

    console.log(`Fulfilling ${max} requests ...`);

    let requestID = await NFTOpt.requestID();

    if (!requestID)
    {
        console.log("Missing requests to fulfill!");

        return;
    }

    while (i !== max)
    {
        if (requestID.lt(1)) break;

        let request = await NFTOpt.requests(requestID);

        if (request.buyer === ADDRESS0)
        {
            requestID = requestID.sub(1);
            continue;
        }

        NFTOpt.connect(signers[Math.floor(Math.random() * signers.length)]).createOption
        (
            requestID
        ,   { value: request.strikePrice }
        );

        console.log("Fulfilled " + requestID);

        ++i;
        requestID = requestID.sub(1);
    }

    let request = await NFTOpt.requests(requestID);

    while (request.buyer === ADDRESS0)
    {
        requestID = requestID.sub(1);

        if (requestID.lt(0)) break;

        request = await NFTOpt.requests(requestID);
    }

    if (requestID.gt(-1))
    {
        await NFTOpt.connect(signers[Math.floor(Math.random() * signers.length)]).createOption
        (
            requestID
        ,   { value: request.strikePrice }
        );

        console.log("Fulfilled " + requestID);
    }

    console.log("Done");
}

createOptions()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });