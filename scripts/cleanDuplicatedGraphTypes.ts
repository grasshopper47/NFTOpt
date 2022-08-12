import fs from "fs";

async function cleanDuplicatedTypes(name : string)
{
    let pathRoot      = `graphs/${name}`;
    let pathConfig    = `${pathRoot}/config.json`;
    let pathGenerated = `${pathRoot}/generated`;
    let pathBuild     = `${pathGenerated}/build`;
    let codefileName  = `${name}Entity.ts`;

    console.log("Removing duplicated type files...");

    // Read contents of config.json from disk
    if (!fs.existsSync(pathConfig)) throw "Missing " + pathConfig;

    let data = fs.readFileSync(pathConfig, { encoding : "utf8", flag : "r" });
    let graphConfigJSON = JSON.parse(data.toString());

    if (!graphConfigJSON.datasources) throw "Missing graph datasources";

    // Get first entity (ABI to ts) codefile
    let pathFirstEntity = `${pathGenerated}/${graphConfigJSON.datasources[0].id}/${codefileName}`;
    if (!fs.existsSync(pathFirstEntity)) throw `Missing entity file - ${pathFirstEntity}`;

    // Keep only one file in generated directory and move it up one level
    fs.cpSync(pathFirstEntity, `${pathGenerated}/${codefileName}`);

    // Remove duplicated entity codefiles
    for (let i = 0; i !==  graphConfigJSON.datasources.length; ++i)
    {
        fs.rmSync(`${pathGenerated}/${graphConfigJSON.datasources[i].id}`, { recursive: true, force: true });
    }

    // Remove build folder (generated WebAssembly files), re-compiled when calling deploy
    if (fs.existsSync(pathBuild)) fs.rmSync(pathBuild, { recursive: true, force: true });

    console.log("Done");
}

cleanDuplicatedTypes(process.argv[2] ?? "")
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
