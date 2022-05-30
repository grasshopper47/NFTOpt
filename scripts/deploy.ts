import { deployLocalDevEnv } from "../src/utils/deployment";

deployLocalDevEnv()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });