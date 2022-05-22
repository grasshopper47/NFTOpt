import {ethers} from "ethers";
import {NFTAsset} from "./declarations";

declare var window: Window & {
    ethereum: any;
};

const networkId = process.env.NEXT_PUBLIC_NETWORK_ID || "1337";
const networks = {
    "1": "mainnet",
    "4": "rinkeby",
    "1337": "localhost",
};
export const networkName = networks[networkId];

export const getEthereumObject = () => {
    const {ethereum} = window;

    return ethereum ?? null;
};

export const setupEthereumEventListeners = (ethereum) => {
    const provider = new ethers.providers.Web3Provider(ethereum, "any");

    provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
            window.location.reload();
        }
    });

    window.ethereum.on("accountsChanged", async (accounts) => {
        window.location.reload();
    });

    return ethereum;
};

export const getCurrentAccount = async () => {
    const {ethereum} = window;

    const accounts = await ethereum.request({method: "eth_accounts"});

    if (!accounts || accounts?.length === 0) {
        return null;
    }

    const account = accounts[0];

    return account;
};

export const connectWallet = async (setAccountCallback: (account: string) => void) => {
    const ethereum = getEthereumObject();

    if (ethereum) {
        ethereum.request({method: "eth_requestAccounts"}).then((res) => setAccountCallback(res[0]));
    } else {
        alert("Please install MetaMask extension");
    }
};

export const getSignedContract = (address, abi) => {
    const {ethereum} = window;

    const provider = new ethers.providers.Web3Provider(ethereum, "any");

    const signer = provider.getSigner();

    return new ethers.Contract(address, abi, signer);
};

export const fetchAssetsForAddress = async (account: string, setAssetsCallback: (assets: NFTAsset[]) => void) => {
    const assets: NFTAsset[] = [];

    await fetch(`https://api.opensea.io/api/v1/assets?owner=${account}&limit=30`)
        .then((res) => res.json())
        .then((res) => {
            if (!res.assets) {
                return;
            }
            for (let asset of res.assets) {
                assets.push({
                    id: asset.id,
                    tokenId: asset.token_id,
                    address: asset.asset_contract.address,
                    name: asset.name,
                    // image: asset.image_url,
                    image: asset.image_preview_url,
                    url: asset.permalink,
                });
            }
        })
        .catch((error) => {
            console.error(error);
        });

    setAssetsCallback(assets);
};
