import { publishNFTCollections } from "../../../utils/publish/NFTCollections";

publishNFTCollections()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
