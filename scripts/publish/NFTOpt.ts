import { deployNFTOptContract, deployNFTOptLibraries, NFTOptContract } from "../../utils/deployment/NFTOpt";
import fs from 'fs';

const addressesPath = "addresses.json";

export async function publishNFTOpt()
{
    // Read contents of addresses.json from disk
    let addressesJSON = { localhost : {} };

    if (fs.existsSync(addressesPath))
    {
        const data = fs.readFileSync(addressesPath, { encoding : "utf8", flag : "r" });
        addressesJSON = JSON.parse(data.toString());
    }

    await deployNFTOptLibraries();
    await deployNFTOptContract();

    // @ts-ignore
    addressesJSON.localhost.NFTOpt = NFTOptContract.address;

    console.log(`Deployed NFTOpt (main contract) @ ${NFTOptContract.address}`);

    // Update addresses.json file with published contract addresses
    fs.writeFileSync(addressesPath, JSON.stringify(addressesJSON));
}

publishNFTOpt()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
