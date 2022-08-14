import { ethers } from "hardhat";
import addresses from "../../addresses.json";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { NFTOpt } from "../../typechain-types";
import { BIGNUMBER0 } from "../../utils/constants";
import { assetsOf, loadAssetsFor } from "../../datasources/assets";
import { NFTAsset } from "../../models/NFTAsset";

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

const generateRequest = (assets : NFTAsset[]) =>
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

    let i = Math.floor(Math.random() * assets.length);
    console.log(i, assets.length);

    return {
        nftContract : assets[i].key.nftContract
    ,   nftId       : assets[i].key.nftId
    ,   strikePrice : strikePrice
    ,   interval    : interval * 86400
    ,   flavor      : flavor
    ,   premium     : premium
    };
}

async function publishRequests()
{
    const [ buyer ] = await ethers.getSigners();

    await loadAssetsFor(buyer.address, ethers.provider);
    let assets = assetsOf(buyer.address);

    // Create completely new instance with the default provider (readonly)
    const NFTOpt =
    new ethers.Contract
    (
        addresses.localhost.NFTOpt
    ,   NFTOptSolContract.abi
    ,   buyer.provider
    ) as NFTOpt;

    let i = 0;
    let max = 10;

    console.log(`Publishing ${max} requests ...`);

    while (++i !== max)
    {
        const request = generateRequest(assets);

        NFTOpt.connect(buyer).publishRequest
        (
            request.nftContract
        ,   request.nftId
        ,   request.strikePrice
        ,   request.interval
        ,   request.flavor
        ,   {
                value: request.premium
            ,   gasLimit: 500_000
            }
        );
    }

    const request = generateRequest(assets);

    await NFTOpt.connect(buyer).publishRequest
    (
        request.nftContract
    ,   request.nftId
    ,   request.strikePrice
    ,   request.interval
    ,   request.flavor
    ,   {
            value: request.premium
        ,   gasLimit: 500_000
        }
    );

    console.log("Done");
}

publishRequests()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
