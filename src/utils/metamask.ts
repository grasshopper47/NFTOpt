import { AnyRecord } from "dns";
import { ethers } from "ethers";

declare var window: Window & {
    ethereum: any;
};

let provider: any = null;
let currentAccount: string = "";

export async function connectWallet(setAccountCallback: (account: string) => void) {
    if (!window.ethereum) {
        alert("Please install MetaMask extension");
        return;
    }

    window.ethereum.request({ method: "eth_requestAccounts" })
        .then((res: string) => setAccountCallback(res[0]));
}

export function setupWalletConnectivityEventListeners() {
    if (!provider) { provider = new ethers.providers.Web3Provider(window.ethereum, "any") }

    if (!currentAccount) {
        window.ethereum.request({ method: "eth_accounts" })
            .then((accounts) => currentAccount = accounts[0]);
    }

    provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
            window.location.reload();
        }
    });

    window.ethereum.on("accountsChanged", async () => { window.location.reload(); });
}

export function getEthereumObject() {
    const { ethereum } = window;

    return ethereum ?? null;
}

export function getCurrentProvider() {
    return provider;
}

export function getCurrentAccount() {
    return currentAccount;
}

export function getSignedContract(address: string, abi: any) {
    return new ethers.Contract(address, abi, provider.getSigner());
}