import { ethers } from "hardhat";
import { deployNFTCollectionContract, NFTCollectionContracts } from "../deployment/NFTCollections";
import { getAddressesJSON, storeAddressesJSON } from "../generators/addresses.json";
import { getGraphConfigJSONTemplate, storeGraphConfigJSON } from "../generators/graph-config.json";

const moduleName = "ERC721";

export async function publishNFTCollections()
{
    // Read contents of addresses.json from disk
    let addressesJSON = getAddressesJSON();

    // Create graphs-compiler config
    let graphConfigJSON = getGraphConfigJSONTemplate(moduleName);

    let blockNumber = await ethers.provider.getBlockNumber();

    let promises : Promise<any>[] = [];

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

                    graphConfigJSON.datasources.push
                    (
                        // @ts-ignore
                        { id: name, address: addressesJSON.localhost[name], startBlock: blockNumber, module: moduleName }
                    );
                }
            )
        );
    }

    await Promise.allSettled(promises);

    // Save JSONs to disk
    storeAddressesJSON(addressesJSON);
    storeGraphConfigJSON(graphConfigJSON);
}
