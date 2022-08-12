import fs from "fs";

export const getGraphConfigJSONTemplate = (name : string, network : string = "localhost") =>
{
    return {
        name : name
    ,   output: `./graphs/${name}/generated/`
    ,   chain: network
    ,   datasources: []
    }
}

export const storeGraphConfigJSON = (obj : { name : string }) =>
{
    fs.writeFileSync(`graphs/${obj.name}/config.json`, JSON.stringify(obj));
}
