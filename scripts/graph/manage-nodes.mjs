import { spawnSync } from "child_process";
import { graphIndexerNode, subgraphs } from "./node.mjs";

let op = process.argv[2] ?? "create";

let commands = [];
for (let s in subgraphs) commands.push(`graph ${op} --node ${graphIndexerNode} ${subgraphs[s]}`);

let result = spawnSync
(
    commands.join(" & "),
    [ ]
,   { shell : true, stdio: 'pipe' }
);

console.log(result.stdout.toString());
