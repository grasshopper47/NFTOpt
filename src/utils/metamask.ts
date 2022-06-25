import { ethers } from "ethers";
import toast from "react-hot-toast";
import { blockNumber } from "./blockchain";

// MetaMasK is present if this variable exists
let _window : Window & { ethereum?: any; };

const _networks : any =
{
    "31337" : "localhost"
// ,   "1"     : "mainnet"
// ,   "4"     : "rinkeby"
};

let _connected = false;
let _provider : ethers.providers.Web3Provider;

let _setAccount : (a : string) => void;

function handleAccountChanged(accounts : string[])
{
    console.log("handleAccountChanged", account());

    _connected = accounts.length !== 0;

    if (!_connected) console.log("Connect MetaMasK");

    _setAccount(_window.ethereum.selectedAddress);
}

function handleNetworkChanged()
{
    _window.location.reload();
}

export function connectWallet()
{
    _window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(handleAccountChanged)
    .catch
    (
        (err) =>
        {
            if (err.code === 4001)   { toast.error("User rejected connection"); }
            if (err.code === -32002) { toast.error("Connection request in progress"); }
        }
    );
}

export function hookMetamask
(
    window_    : Window & { ethereum?: any; }
,   setAccount : (a : string) => void
)
{
    if (_connected) return;

    if (_window)  throw "Shomething went wrong, should be null";
    if (!window_) throw "Shomething went wrong, should have a value";

    if (!window_.ethereum) { console.log("Install MetaMasK"); return; }

    _window = window_;      // Used to expose short-hand accessors like account(), network(), connected()

    console.log("MetaMasK init");

    _setAccount = setAccount;

    _provider = new ethers.providers.Web3Provider(_window.ethereum, "any");
    _provider.getBlockNumber().then(r => blockNumber.current = r);

    _window.ethereum.on("chainChanged", handleNetworkChanged);
    _window.ethereum.on('accountsChanged', handleAccountChanged);

    connectWallet();
}

export const setWindow = (window_ : Window & { ethereum?: any; }) => _window = window_;

export const account   = () => _window?.ethereum.selectedAddress;
export const network   = () => _networks[_window?.ethereum.networkVersion];
export const connected = () => _connected;
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