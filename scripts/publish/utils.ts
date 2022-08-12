import fs from "fs";

const addressesPath = "addresses.json";

export const getAddressesJSON = () =>
{
    if (!fs.existsSync(addressesPath)) return {};

    const data = fs.readFileSync(addressesPath, { encoding : "utf8", flag : "r" });
    return JSON.parse(data.toString());
}

export const storeAddressesJSON = (obj : any) =>
{
    fs.writeFileSync(addressesPath, JSON.stringify(obj));
}
