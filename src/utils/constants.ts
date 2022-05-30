const _networks: any = {
    "1": "mainnet",
    "4": "rinkeby",
    "31337": "localhost",
};

const _network_id: string = process.env.NEXT_PUBLIC_NETWORK_ID || "31337";

export const floatNumberRegex = /^([0-9]*[.])?[0-9]*$/;

export const ADDRESS0: string = "0x0000000000000000000000000000000000000000";
export const networkName: string = _networks[_network_id];
export const SECONDS_IN_A_DAY = 86400;
export const TOAST_DURATION = 2000;
export const MAX_MINTABLE_TOKENS = 5;
