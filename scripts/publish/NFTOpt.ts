import { publishNFTOpt } from "../../utils/publish/NFTOpt";

publishNFTOpt()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
