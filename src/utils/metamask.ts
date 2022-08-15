import { ethers } from "ethers";
import { network, provider, setNetwork, setProvider } from "../../datasources/provider";
import { setBlockNumber } from "../../datasources/blockNumber";
import toast from "react-hot-toast";

// MetaMasK is present if this variable exists
declare var window : Window & { ethereum?: any; };

export let connected : boolean;
export let connecting : boolean;
export let signer : ethers.Signer;

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
    connecting = true;

    window.ethereum
    .request({ method: "eth_requestAccounts" })
    .then(_handleSignerChanged)
    .catch
    (
        (err: { code: number; }) =>
        {
            if (err.code === 4001)   { toast.error("User rejected connection"); }
            if (err.code === -32002) { toast.error("Connection request in progress"); }

            connecting = false;
        }
    );
}

function _accountChanged(account : string)
{
    connected = account != null && account.length !== 0;
    connecting = false;

    if (!connected) console.log("MetaMasK: connect an account");

    // Trigger UI update
    _setAccount(account);
    console.log("setAccount", account);
}

async function _handleSignerChanged()
{
    if (!signer) return;

    let address = await signer.getAddress();
    _accountChanged(address);
}

function _handleNetworkChanged(id : string)
{
    let id_ = parseInt(id);

    if (id_ === NaN)
    {
        setProvider({} as any);
        console.log("MetaMasK: connect a blockchain node");
        return;
    }

    setProvider(new ethers.providers.Web3Provider(window.ethereum, "any"));
    setNetwork(id_);

    provider.getBlockNumber().then(setBlockNumber);
    signer  = provider.getSigner();

    // Trigger UI update
    _setChainID(id_);

    if (network) console.log("setChain", network);
    else console.log("MetaMasK: select a supported network");

    // window.location.reload();
}

let _setAccount : (a : string) => void;
let _setChainID : (a : number) => void;
