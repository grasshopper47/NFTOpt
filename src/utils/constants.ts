const networks: any = {
    "1": "mainnet",
    "4": "rinkeby",
    "31337": "localhost",
};

const networkId: string = process.env.NEXT_PUBLIC_NETWORK_ID || "31337";

export const addressEmpty: string = "0x0000000000000000000000000000000000000000";
export const floatNumberRegex = /^([0-9]*[.])?[0-9]*$/;
export const networkName: string = networks[networkId];
export const SECONDS_IN_A_DAY = 86400;
export const TOAST_DURATION = 4000;
