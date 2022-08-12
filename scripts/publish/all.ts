import { deployNFTCollectionContract, NFTCollectionContracts } from "../../utils/deployment/NFTCollections";
import { deployNFTOptContract, deployNFTOptLibraries, NFTOptContract } from "../../utils/deployment/NFTOpt";
import { getAddressesJSON, storeAddressesJSON } from "./utils";

export async function publishAll()
{
    // Read contents of addresses.json from disk
    let addressesJSON = getAddressesJSON();

    let promises : Promise<any>[] = [];

    promises.push
    (
        deployNFTOptLibraries()
        .then(deployNFTOptContract)
        .then
        (
            () =>
            {
                // @ts-ignore
                addressesJSON.localhost.NFTOpt = NFTOptContract.address;

                console.log(`Deployed NFTOpt (main contract) @ ${NFTOptContract.address}`);
            }
        )
    )

    for (const name of Object.keys(NFTCollectionContracts))
    {
        promises.push
        (
            deployNFTCollectionContract(name)
            .then
            (
                () =>
                {
                    // @ts-ignore
                    addressesJSON.localhost[name] = NFTCollectionContracts[name].instance.address;

                    // @ts-ignore
                    console.log(`Deployed ${name} @ ${addressesJSON.localhost[name]}`);
                }
            )
        );
    }

    await Promise.allSettled(promises);

    // Update addresses.json file with published contract addresses
    storeAddressesJSON(addressesJSON);
}

publishAll()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
