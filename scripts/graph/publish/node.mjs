import { execSync } from "child_process";
import { graphIndexerNode, ipfsNode } from "../node.mjs";

function pubishNode()
{
    let name = process.argv[2];
    if (!name) throw "Must provide a Graph node name as 1st argument";

    let version = process.argv[3] ?? "v0.0.1";

    let result;

    try { result = execSync (`cd graphs/${name}/generated; graph deploy ${name} --version-label ${version} --ipfs ${ipfsNode} --node ${graphIndexerNode}`); }
    catch (e)
    {
        console.log(e.stdout.toString());

        return;
    }

    console.log(result.toString());
}

pubishNode();