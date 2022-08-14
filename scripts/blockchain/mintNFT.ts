import { ethers } from "hardhat";
import addresses from "../../addresses.json";
import { ABIs } from "../../utils/constants";

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

async function mintNFT()
{
    const [ buyer ] = await ethers.getSigners();

    let address = contractAddresses[Math.floor(Math.random() * maxIndex)];

    // Create completely new instance with the default provider (readonly)
    const NFTContract =
    new ethers.Contract
    (
        address
    ,   [
            ABIs.ERC721.name
        ,   ABIs.ERC721.ownerOf
        ,   ABIs.ERC721.tokenURI
        ,   ABIs.ERC721.getApproved
        ,   ABIs.ERC721.approve
        ,   ABIs.ERC721.mint
        ,   ABIs.ERC721.Events.Approval
        ,   ABIs.ERC721.Events.Transfer
        ]
    ,   buyer
    );

    await NFTContract.mint();
}

mintNFT()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
