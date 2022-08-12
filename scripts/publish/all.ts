import { publishNFTCollections } from "../../utils/publish/NFTCollections";
import { publishNFTOpt } from "../../utils/publish/NFTOpt";
import { clearAddressesJSON } from "../../utils/generators/addresses.json";

clearAddressesJSON();

publishNFTOpt()
    .then( () => { console.log(""); return publishNFTCollections(); } )
    .then( () => { console.log(""); process.exit(0); } )
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
