import { deployNFTCollectionContract, NFTCollectionContracts } from "../../utils/deployment/NFTCollections";
import fs from "fs";
import { ethers } from "hardhat";

const addressesPath = "addresses.json";

export async function publishNFTCollections()
{
    // Read contents of addresses.json from disk
    let addressesJSON = {};

    if (fs.existsSync(addressesPath))
    {
        const data = fs.readFileSync(addressesPath, { encoding : "utf8", flag : "r" });
        addressesJSON = JSON.parse(data.toString());
    }

    // Create graphs/config.json
    let graphConfigJSON = {
        output: "./graphs/ERC721/generated/",
        chain: "localhost",
        datasources: []
    };

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

                    graphConfigJSON.datasources.push
                    (
                        // @ts-ignore
                        { id: name, address: addressesJSON.localhost[name], startBlock: blockNumber, module: [ "ERC721" ] }
                    )

                    // @ts-ignore
                    console.log(`Deployed ${name} @ ${addressesJSON.localhost[name]}`);
                }
            )
        );
    }

    await Promise.allSettled(promises);

    // Update addresses.json file with published contracts addresses
    fs.writeFileSync("addresses.json", JSON.stringify(addressesJSON));

    // Update graphs/config.json file
    fs.writeFileSync("graphs/config.json", JSON.stringify(graphConfigJSON));
}

publishNFTCollections()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
