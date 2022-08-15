import { ethers } from "ethers";

export let provider : ethers.providers.JsonRpcProvider = {} as any;
export let network : string | null;
export let scanner : string | null;

export const setProvider = (provider_ : ethers.providers.JsonRpcProvider) => provider = provider_;
export const setNetwork = (id_ : number) =>
{
    network = _networks[id_];
    scanner = _scanners[id_];
}

const _networks : any =
{
    "31337" : "localhost"
// ,   "1"     : "mainnet"
// ,   "4"     : "rinkeby"
};

const _scanners : any =
{
    "31337" : "https://etherscan.io"
// ,   "1"     : "https://etherscan.io"
// ,   "4"     : "rinkeby"
};
