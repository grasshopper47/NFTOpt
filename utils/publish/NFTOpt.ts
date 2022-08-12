import { ethers } from "hardhat";
import { deployNFTOptContract, deployNFTOptLibraries, NFTOptContract } from "../deployment/NFTOpt";
import { getAddressesJSON, storeAddressesJSON } from "../generators/addresses.json";
import { getGraphConfigJSONTemplate, storeGraphConfigJSON } from "../generators/graph-config.json";

const moduleName = "NFTOpt";

export async function publishNFTOpt()
{
    await deployNFTOptLibraries();
    await deployNFTOptContract();

    console.log(`Deployed NFTOpt (main contract) @ ${NFTOptContract.address}`);

    let blockNumber = await ethers.provider.getBlockNumber();

    // Read contents of addresses.json from disk
    let addressesJSON = getAddressesJSON();

    // @ts-ignore
    addressesJSON.localhost.NFTOpt = NFTOptContract.address;

    storeAddressesJSON(addressesJSON);

    // Create graphs-compiler config
    let graphConfigJSON = getGraphConfigJSONTemplate(moduleName);

    graphConfigJSON.datasources.push
    (
        // @ts-ignore
        { id: moduleName, address: addressesJSON.localhost[moduleName], startBlock: blockNumber, module: moduleName }
    );

    storeGraphConfigJSON(graphConfigJSON);
}
