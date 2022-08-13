import { execSync } from "child_process";
import fs from "fs";

function generateSchema()
{
    let name = process.argv[2];
    if (!name) throw "Must provide a Graph node name as 1st argument";

    let result;

    // Generate schema and .yaml file via utility module
    try
    {
        result = execSync
        (`
            npx graph-compiler ${name === "NFTOpt" && "--common-types ''"} \
            --config graphs/${name}/config.json \
            --include graphs/${name} \
            --export-schema \
            --export-subgraph
        `);
    }
    catch (e)
    {
        console.log(e.stdout.toString());

        return;
    }

    console.log(result.toString());

    // Graph codegen
    try { result = execSync(`cd graphs/${name}/generated; graph codegen --output-dir .`); }
    catch (e)
    {
        console.log(e.stdout.toString());

        return;
    }

    console.log(result.toString());

    let pathRoot      = `graphs/${name}`;
    let pathConfig    = `${pathRoot}/config.json`;
    let pathGenerated = `${pathRoot}/generated`;
    let pathBuild     = `${pathGenerated}/build`;

    console.log("Removing duplicated type files...");

    // Get name of ABI from yaml spec
    let yamlContents = fs.readFileSync(`${pathRoot}/${name}.yaml`, { encoding : "utf8", flag : "r" });
    let codefileName = yamlContents.match("abi: [a-zA-z0-9]*")?.at(0)?.replace("abi: ", "");

    if (!codefileName) throw `Failed to extract abi name from ${name}.yaml file`

    codefileName += ".ts";

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
    for (let i = 0; i !== graphConfigJSON.datasources.length; ++i)
    {
        fs.rmSync(`${pathGenerated}/${graphConfigJSON.datasources[i].id}`, { recursive: true, force: true });
    }

    // Remove build folder (generated WebAssembly files), re-compiled when calling deploy
    if (fs.existsSync(pathBuild)) fs.rmSync(pathBuild, { recursive: true, force: true });

    console.log(`\n${name} graph schema generation completed successfully\n`);
}

generateSchema();
