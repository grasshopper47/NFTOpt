import fs from "fs";

const pathConfig = "graphs/config.json";
const pathERC721 = "graphs/generated/ERC721";

export async function cleanDuplicatedTypes()
{
    console.log("Removing duplicated type files...");

    // Read contents of config.json from disk
    let graphConfigJSON = { datasources: [] as { id: number }[] };

    if (!fs.existsSync(pathConfig))
    {
        console.error("Missing " + pathConfig);

        return;
    }

    const data = fs.readFileSync(pathConfig, { encoding : "utf8", flag : "r" });
    graphConfigJSON = JSON.parse(data.toString());

    if (!graphConfigJSON.datasources)
    {
        console.error("Missing graph datasources");

        return;
    }

    // Get name of ABI from yaml spec
    const yamlContents = fs.readFileSync("graphs/ERC721.yaml", { encoding : "utf8", flag : "r" });
    let name = yamlContents.match("abi: [a-zA-z0-9]*")?.at(0)?.replace("abi: ", "") ?? "";

    // Keep only one file in generated directory
    if (fs.existsSync(`${pathERC721}/${graphConfigJSON.datasources[0].id}/${name}.ts`))
    {
        fs.cpSync(`${pathERC721}/${graphConfigJSON.datasources[0].id}/${name}.ts`, `${pathERC721}/${name}.ts`);
    }

    // Remove all duplicated type files
    for (let i = 0; i !==  graphConfigJSON.datasources.length; ++i)
    {
        name = `${pathERC721}/${graphConfigJSON.datasources[i].id}`;

        if (fs.existsSync(name)) fs.rmSync(name, { recursive: true, force: true });
    }

    // Cleanup build folder
    name = "graphs/generated/ERC721/build";
    if (fs.existsSync(name)) fs.rmSync(name, { recursive: true, force: true });

    console.log("Done");
}

cleanDuplicatedTypes()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
