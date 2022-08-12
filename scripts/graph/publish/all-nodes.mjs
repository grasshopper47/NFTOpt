import { spawnSync } from "child_process";
import { subgraphs } from "../node.mjs";

let commands = [];
for (let s in subgraphs) commands.push(`node scripts/graph/publish/node.mjs ${subgraphs[s]}`);

let result = spawnSync
(
    commands.join(" & "),
    [ ]
,   { shell : true, stdio: 'pipe' }
);

console.log(result.stdout.toString());
