import { ethers } from "ethers";
import toast from "react-hot-toast";
import { blockNumber } from "./blockchain";

// MetaMasK is present if this variable exists
declare var window: Window & { ethereum: any; };

const _networks : any =
{
    "1"     : "mainnet"
,   "4"     : "rinkeby"
,   "31337" : "localhost"
};

let _connected = false;
let _provider : ethers.providers.Web3Provider;

let _setAccount : (a : string) => void;

function setAccounts(accounts : string[])
{
    console.log("setAccount", account(), network());

    _connected = accounts.length !== 0;

    if (!_connected) console.log("Connect MetaMasK");

    _setAccount(window.ethereum.selectedAddress);
}

function setChainID()
{
    window.location.reload();
}

export function connectWallet()
{
    window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(setAccounts)
    .catch
    (
        (err) =>
        {
            if (err.code === 4001)   { toast.error("User rejected connection"); }
            if (err.code === -32002) { toast.error("Connection request in progress"); }
        }
    );
}

export function hookMetamask(setAccount : (a : string) => void)
{
    console.log("MetaMasK init");

    if (!window.ethereum) { console.log("Install MetaMasK"); return; }

    if (_connected) return;

    _setAccount = setAccount;

    _provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    _provider.getBlockNumber().then(r => blockNumber.current = r);

    window.ethereum.on("chainChanged", setChainID);
    window.ethereum.on('accountsChanged', setAccounts);

    connectWallet();
}

export const connected = () => _connected;
export const account   = () => window.ethereum.selectedAddress;
export const network   = () => _networks[window.ethereum.networkVersion];
export const provider  = () => _provider;
export const signer    = () => _provider.getSigner();

export function getSignedContract(address: string, abi: any)
{
    return new ethers.Contract(address, abi, _provider.getSigner());
}

export function getProviderContract(address: string, abi: any)
{
    return new ethers.Contract(address, abi, _provider);
}