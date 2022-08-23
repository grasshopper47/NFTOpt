import { ethers } from "ethers";
import { network, provider, setNetwork, setProvider } from "../../datasources/provider";
import { setBlockNumber } from "../../datasources/blockNumber";
import toast from "react-hot-toast";

// MetaMasK is present if this variable exists
declare var window : Window & { ethereum?: any; };

export let connected  : boolean;
export let connecting : boolean;
export let signer     : ethers.Signer;

export const hookMetamask =
(
    setAccount : (a : string) => void
,   setChainID : (a : number) => void
) =>
{
    if (!window.ethereum) { console.log("Install MetaMasK"); return; }

    console.log("MetaMasK: init");

    _setAccount = setAccount;
    _setChainID = setChainID;

    window.ethereum.on("chainChanged"   , _handleNetworkChanged);
    window.ethereum.on("accountsChanged", _handleSignerChanged);

    window.ethereum.request({ method: "eth_chainId" }).then(_handleNetworkChanged);
    window.ethereum._metamask.isUnlocked().then( (y : boolean) => y && connectWallet() );
}

export const connectWallet = () =>
{
    connecting = true;

    _setAccount("");

    window.ethereum.request({ method: "eth_requestAccounts" })
    .then(_handleSignerChanged)
    .catch
    (
        (err: { code: number; }) =>
        {
            if (err.code === 4001)   { toast.error("User rejected connection");       return; }
            if (err.code === -32002) { toast.error("Connection request in progress"); return; }
        }
    )
    .then( () => connecting = false );
}

const _accountChanged = (account : string) =>
{
    connected = account != null && account.length !== 0;

    if (connected) console.log("setAccount", account);
    else           console.log("MetaMasK: connect an account");

    // Trigger UI update
    _setAccount(account);
}

const _handleSignerChanged = () =>
{
    if (window.ethereum.selectedAddress) signer.getAddress().then(_accountChanged);
    else                                 _accountChanged("");
}

const _handleNetworkChanged = (ID : string) =>
{
    let ID_ = parseInt(ID);

    if (ID_ === NaN)
    {
        setNetwork(-1);
        setProvider(null as any);

        console.log("MetaMasK: connect a blockchain node");

        return;
    }

    setProvider(new ethers.providers.Web3Provider(window.ethereum, "any"));
    setNetwork(ID_);

    provider.getBlockNumber().then(setBlockNumber);
    signer = provider.getSigner();

    if (network) console.log("setChain", network);
    else         console.log("MetaMasK: select a supported network");

    // Trigger UI update
    _setChainID(ID_);
}

let _setAccount : (a : string) => void;
let _setChainID : (a : number) => void;
