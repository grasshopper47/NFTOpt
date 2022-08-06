import { ethers, Signer } from "ethers";
import toast from "react-hot-toast";

// MetaMasK is present if this variable exists
declare var window : Window & { ethereum?: any; };

let _connected = false;

const _networks : any =
{
    "31337" : "localhost"
// ,   "1"     : "mainnet"
// ,   "4"     : "rinkeby"
};
let _network : string;

const _scanners : any =
{
    "31337" : "https://etherscan.io"
// ,   "1"     : "https://etherscan.io"
// ,   "4"     : "rinkeby"
};
let _scanner : string;

let _provider : ethers.providers.Web3Provider;
let _signer   : Signer;

let _setAccount : (a : string) => void;
let _setChainID : (a : number) => void;

export function hookMetamask
(
    setAccount : (a : string) => void
,   setChainID : (a : number) => void
)
{
    if (!window.ethereum) { console.log("Install MetaMasK"); return; }

    console.log("MetaMasK: init");

    _setAccount = setAccount;
    _setChainID = setChainID;

    window.ethereum.on("chainChanged"   , handleChainIDChanged);
    window.ethereum.on('accountsChanged', handleAccountChanged);

    handleChainIDChanged(window.ethereum.networkVersion);
}

export function createProvider()
{
    _provider = new ethers.providers.Web3Provider(window.ethereum, "any");

    _signer = _provider.getSigner();
    _signer.getAddress()
    .then(handleAccountChanged)
    .catch(() => handleAccountChanged(""));

    return _provider;
}

export async function connectWallet()
{
    window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(handleAccountChanged)
    .catch
    (
        (err: { code: number; }) =>
        {
            if (err.code === 4001)   { toast.error("User rejected connection"); }
            if (err.code === -32002) { toast.error("Connection request in progress"); }
        }
    );
}

function _setNetwork(id : number)
{
    _network = _networks[id];
    _scanner = _scanners[id];
}

function handleAccountChanged(account : string)
{
    _connected = account != null && account.length !== 0;

    if (!_connected) console.log("MetaMasK: connect an account");

    _setAccount(account);

    console.log("setAccount", account);
}

function handleChainIDChanged(id : string)
{
    let id_ = parseInt(id);

    if (id_ === NaN)
    {
        console.log("MetaMasK: connect a blockchain node");
        return;
    }

    _setNetwork(id_);
    _setChainID(id_);

    if (!_network) console.log("MetaMasK: select a supported network");

    console.log("setChainID", id_);

    // window.location.reload();
}

export const network   = () => _network;
export const scanner   = () => _scanner;
export const connected = () => _connected;
export const provider  = () => _provider;
export const signer    = () => _signer;
