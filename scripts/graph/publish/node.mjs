import { execSync } from "child_process";
import { graphIndexerNode, ipfsNode } from "../node.mjs";

function pubishNode()
{
    let name = process.argv[2];
    if (!name) throw "Must provide a Graph node name as 1st argument";

    let version = process.argv[3] ?? "v0.0.1";

    let result;
    fetch
    (
        `http://127.0.0.1:8000/subgraphs/name/${name}`
    ,   {
            method: "POST"
        ,   body : JSON.stringify( { query: "query { test123 }" } )
        }
    )
    .then(res => res.json())
    .then
    (
        (r) =>
        {
            if (r.errors.length === 1 && r.errors[0].message.search("does not exist") !== -1)
            {
                try { result = execSync (`graph create --node ${graphIndexerNode} ${name}`); }
                catch (e)
                {
                    console.log(e.stdout.toString());

                    return;
                }

                console.log(result.toString());
            }

            try
            {
                result = execSync
                (`
                    cd graphs/${name}/generated;  \
                                                  \
                    graph deploy ${name}          \
                    --version-label ${version}    \
                    --ipfs ${ipfsNode}            \
                    --node ${graphIndexerNode}
                `);
            }
            catch (e)
            {
                console.log(e.stdout.toString());

                return;
            }

            console.log(result.toString());
        }
    )
}

pubishNode();