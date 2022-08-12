import { publishNFTCollections } from "../../../utils/publish/NFTCollections";
import { publishNFTOpt } from "../../../utils/publish/NFTOpt";
import { clearAddressesJSON } from "../../../utils/generators/addresses.json";

clearAddressesJSON();

let promises =
[
    publishNFTOpt()
        .then( () => console.log("") )
        .catch((error) => {
            console.error(error);
            process.exit(1);
        })

,   publishNFTCollections()
        .then( () => console.log("") )
        .catch((error) => {
            console.error(error);
            process.exit(1);
        })
];

Promise.all(promises)
    .then( () => process.exit(0) )
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
