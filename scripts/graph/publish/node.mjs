import { spawnSync } from "child_process";
import { graphIndexerNode, ipfsNode } from "../node.mjs";

let name = process.argv[2];
if (!name) throw "Graph name cannot be null";

let version = process.argv[3] ?? "v0.0.1";

let result = spawnSync
(
    `cd graphs/${name}/generated;
    graph deploy ${name} --version-label ${version} --ipfs ${ipfsNode} --node ${graphIndexerNode}`,
    []
,   { shell : true, stdio: 'pipe' }
);

console.log(result.stdout.toString());
