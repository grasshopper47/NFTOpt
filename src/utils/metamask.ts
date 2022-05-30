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

export async function hookUpMetamask() {

    provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newN, oldN) => { if (oldN) { window.location.reload(); } });

    let accounts = await window.ethereum.request({ method: "eth_accounts" });
    currentAccount = accounts[0];

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
    return new ethers.Contract(address, abi, getCurrentProvider().getSigner());
}