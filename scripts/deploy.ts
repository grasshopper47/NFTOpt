import {
    contracts,
    deployMainContract,
    deployMainContractLibraries,
    deployNFTCollectionContract,
    NFTOptContract
} from "../src/utils/deployment";

export async function deployAll()
{
    // Construct a JSON to write to disk after deployment
    let addressesJSON: Record<string, any> = {};

    let promises : Promise<any>[] = [];

    promises.push
    (
        deployMainContractLibraries()
        .then(deployMainContract)
        .then
        (
            () =>
            {
                addressesJSON.NFTOpt = NFTOptContract.address;

                console.log(`Deployed NFTOpt (main contract) @ ${NFTOptContract.address}`);
            }
        )
    );

    for (const name of Object.keys(contracts))
    {
        promises.push
        (
            deployNFTCollectionContract(name)
            .then
            (
                () =>
                {
                    addressesJSON[name] = contracts[name].instance.address;

                    console.log(`Deployed ${name} @ ${addressesJSON[name]}`);
                }
            )
        );
    }

    await Promise.allSettled(promises);

    // Update addresses.json file with published contract addresses
    const fs = require("fs");
    await fs.writeFileSync("addresses.json", JSON.stringify({ localhost: addressesJSON }));
}

deployAll()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });