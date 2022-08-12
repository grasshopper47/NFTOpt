import { ethers } from "hardhat";
import { deployNFTOptContract, deployNFTOptLibraries, NFTOptContract } from "../deployment/NFTOpt";
import { getAddressesJSON, storeAddressesJSON } from "../generators/addresses.json";
import { getGraphConfigJSONTemplate, storeGraphConfigJSON } from "../generators/graph-config.json";

const moduleName = "NFTOpt";

export async function publishNFTOpt()
{
    // Read contents of addresses.json from disk
    let addressesJSON = getAddressesJSON();

    // Create graphs-compiler config
    let graphConfigJSON = getGraphConfigJSONTemplate(moduleName);

    await deployNFTOptLibraries();
    await deployNFTOptContract();

    let blockNumber = await ethers.provider.getBlockNumber();

    // @ts-ignore
    addressesJSON.localhost.NFTOpt = NFTOptContract.address;

    console.log(`Deployed NFTOpt (main contract) @ ${NFTOptContract.address}`);

    graphConfigJSON.datasources.push
    (
        // @ts-ignore
        { id: moduleName, address: addressesJSON.localhost[moduleName], startBlock: blockNumber, module: moduleName }
    );

    // Save JSONs to disk
    storeAddressesJSON(addressesJSON);
    storeGraphConfigJSON(graphConfigJSON);
}
