import { contracts } from "../utils/deployment";
import NFTOptSolContract from "../artifacts/contracts/NFTOpt.sol/NFTOpt.json";

import addresses from "../addresses.json";
import { ethers } from "hardhat";
import { NFTOpt } from "../typechain-types";
import { BigNumber } from "ethers";
import { BIGNUMBER0 } from "../utils/constants";

export async function publishRequests()
{
    let [ buyer ] = await ethers.getSigners();

    // Create completely new instance with the default provider (readonly)
    let NFTOpt =
    new ethers.Contract
    (
        addresses.localhost.NFTOpt
    ,   NFTOptSolContract.abi
    ,   buyer.provider
    ) as NFTOpt;

    let contractAddresses =
    [
        addresses.localhost.AI_NFT
    ,   addresses.localhost.AN_NFT
    ,   addresses.localhost.EH_NFT
    ,   addresses.localhost.NK_NFT
    ,   addresses.localhost.SP_NFT
    ,   addresses.localhost.THP_NFT
    ,   addresses.localhost.TH_NFT
    ];

    let maxIndex = contractAddresses.length;

    let i = 0;
    while (++i != 10)
    {
        let nftContract = contractAddresses[Math.floor(Math.random() * maxIndex)];
        let nftId       = Math.floor(Math.random() * 4) + 1;

        let strikePrice = ethers.utils.parseEther((Math.random() * 25 + 1).toString().slice(0, Math.floor(Math.random() * 18) + 1));
        let premium = BIGNUMBER0;
        while (premium.toString() === "0")
        {
            premium = ethers.utils.parseEther(Math.random().toString().slice(0, Math.floor(Math.random() * Math.random() * 18) + 1));
        }

        let interval = Math.floor(Math.random() * 30) + 1;

        let flavor = Math.floor(Math.random() * 2);

        console.log(premium,strikePrice,flavor, interval);

        await NFTOpt.connect(buyer).publishRequest
        (
            nftContract
        ,   nftId
        ,   strikePrice
        ,   interval * 86400
        ,   flavor
        ,   { value: premium }
        );
    }
}

publishRequests()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });