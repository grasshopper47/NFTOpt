import { deployNFTOptContract, deployNFTOptLibraries, NFTOptContract } from "../../utils/deployment/NFTOpt";
import fs from 'fs';
import { getAddressesJSON, storeAddressesJSON } from "./utils";

export async function publishNFTOpt()
{
    // Read contents of addresses.json from disk
    let addressesJSON = getAddressesJSON();

    await deployNFTOptLibraries();
    await deployNFTOptContract();

    // @ts-ignore
    addressesJSON.localhost.NFTOpt = NFTOptContract.address;

    console.log(`Deployed NFTOpt (main contract) @ ${NFTOptContract.address}`);

    // Update addresses.json file with published contract addresses
    storeAddressesJSON(addressesJSON);
}

publishNFTOpt()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
