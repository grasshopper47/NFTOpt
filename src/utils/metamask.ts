import { ethers } from "ethers";
import { setBlockNumber } from "../../datasources/blockNumber";
import toast from "react-hot-toast";

// MetaMasK is present if this variable exists
declare var window : Window & { ethereum?: any; };

export const network   = () => _network;
export const scanner   = () => _scanner;
export const connected = () => _connected;
export const provider  = () => _provider;
export const signer    = () => _signer;

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

    window.ethereum.on("chainChanged"   , _handleNetworkChanged);
    window.ethereum.on('accountsChanged', _handleSignerChanged);

    _handleNetworkChanged(window.ethereum.networkVersion);
}

export async function connectWallet()
{
    window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(_handleSignerChanged)
    .catch
    (
        (err: { code: number; }) =>
        {
            if (err.code === 4001)   { toast.error("User rejected connection"); }
            if (err.code === -32002) { toast.error("Connection request in progress"); }
        }
    );
}

function _accountChanged(account : string)
{
    _connected = account != null && account.length !== 0;
    if (!_connected) console.log("MetaMasK: connect an account");

    _setAccount(account);
    console.log("setAccount", account);
}

async function _handleSignerChanged()
{
    if (!_signer) return;

    let address = await _signer.getAddress();
    _accountChanged(address);
}

function _handleNetworkChanged(id : string)
{
    let id_ = parseInt(id);

    if (id_ === NaN)
    {
        console.log("MetaMasK: connect a blockchain node");
        return;
    }

    _network  = _networks[id_];
    _scanner  = _scanners[id_];
    _provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    _signer   = _provider.getSigner();

    _provider.getBlockNumber().then(setBlockNumber);

    _setChainID(id_);

    if (_network) console.log("setChain", _network);
    else console.log("MetaMasK: select a supported network");

    // window.location.reload();
}

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
let _signer   : ethers.Signer;

let _setAccount : (a : string) => void;
let _setChainID : (a : number) => void;
