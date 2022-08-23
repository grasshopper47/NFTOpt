export const fetchFromGraphNode = async (name : string, query : any) =>
{
    const reply = await fetch
    (
        `http://127.0.0.1:8000/subgraphs/name/${name}`
    ,   {
            method : "POST"
        ,   body   : JSON.stringify( { query: query } )
        }
    )
    .catch( () => { return { json: () => "" } } );

    const json = await reply.json();

    if (json.errors)
    {
        for (const e of json.errors) console.error(e.message);

        return "";
    }

    return json;
}
