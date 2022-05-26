import {ethers} from "ethers";
import React from "react";
import {NFTOpt} from "../../typechain-types/contracts/NFTOpt";
import {NFTAsset, Option, OptionWithNFTDetails} from "./declarations";
import {address0} from "./dummyData";

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

export function getEthereumObject() {
    const {ethereum} = window;

    return ethereum ?? null;
}

export function setupEthereumEventListeners(ethereum) {
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
}

export async function getCurrentAccount() {
    const {ethereum} = window;

    const accounts = await ethereum.request({method: "eth_accounts"});

    if (!accounts || accounts?.length === 0) {
        return null;
    }

    const account = accounts[0];

    return account;
}

export async function connectWallet(setAccountCallback: (account: string) => void) {
    const ethereum = getEthereumObject();

    if (ethereum) {
        ethereum.request({method: "eth_requestAccounts"}).then((res) => setAccountCallback(res[0]));
    } else {
        alert("Please install MetaMask extension");
    }
}

export function getSignedContract(address, abi) {
    const {ethereum} = window;

    const provider = new ethers.providers.Web3Provider(ethereum, "any");

    const signer = provider.getSigner();

    return new ethers.Contract(address, abi, signer);
}

export async function fetchAssetsForAddress(account: string, setAssetsCallback: (assets: NFTAsset[]) => void) {
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
                    image: asset.image_preview_url,
                    url: asset.permalink,
                });
            }
        })
        .catch((error) => {
            console.error(error);
        });

    setAssetsCallback(assets);
}

export async function fetchNFTDetailsForOneOptions(
    nftContract: string,
    nftTokenId: string,
    setAssetCallback: (asset: NFTAsset) => void
) {
    let asset: NFTAsset | null = null;

    await fetch(`https://api.opensea.io/api/v1/asset/${nftContract}/${nftTokenId}/`)
        .then((res) => res.json())
        .then((res) => {
            if (!res) {
                return;
            }
            asset = {
                id: res.id,
                tokenId: nftTokenId,
                address: nftContract,
                name: res.name,
                image: res.image_preview_url,
                url: res.permalink,
            };
        })
        .catch((error) => {
            console.error(error);
        });

    setAssetCallback(asset);
}

export async function fetchNFTDetailsForMultipleOptions(
    options: Option[],
    setOptionsCallback: (optionsWithNFTDetails: OptionWithNFTDetails[]) => void
) {
    const optionsWithNFTDetails: OptionWithNFTDetails[] = [];
    let asset: NFTAsset | null = null;

    for (let option of options) {
        await fetch(`https://api.opensea.io/api/v1/asset/${option.nftContract}/${option.nftId}/`)
            .then((res) => res.json())
            .then((res) => {
                if (!res) {
                    return;
                }
                asset = {
                    id: res.id,
                    tokenId: option.nftId,
                    address: option.nftContract,
                    name: res.name,
                    image: res.image_preview_url,
                    url: res.permalink,
                };
                optionsWithNFTDetails.push({
                    ...option,
                    asset,
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    setOptionsCallback(optionsWithNFTDetails);
}

export function getAccountDisplayValue(account: string) {
    return account.slice(0, 6) + "..." + account.slice(-4);
}

function checkOptionExists(option: Option): boolean {
    if (
        option.buyer === address0 ||
        option.nftContract === address0 ||
        option.nftId === "0" ||
        option.premium === 0 ||
        option.strikePrice === 0 ||
        !option.interval
    ) {
        return false;
    }
    return true;
}

export async function loadContractOptions(contract: NFTOpt, setOptionsCallback: (options: Option[]) => void) {
    let options: Option[] = [];
    try {
        const optionsLength = await (await contract.optionID()).toNumber();
        for (let optionId = 0; optionId <= optionsLength; ++optionId) {
            const contractOption = await contract.options(optionId);
            console.log({contractOption});
            const option: Option = {
                id: optionId.toString(),
                buyer: contractOption.buyer,
                seller: contractOption.seller,
                flavor: contractOption.flavor,
                interval: contractOption.interval,
                nftContract: contractOption.nftContract,
                nftId: contractOption.nftId.toString(),
                premium: contractOption.premium.toNumber(),
                startDate: contractOption.startDate.toNumber(),
                state: contractOption.state,
                strikePrice: contractOption.strikePrice.toNumber(),
            };
            if (checkOptionExists(option)) {
                options.push(option);
            }
        }
        setOptionsCallback(options);
    } catch (error) {
        console.error(error);
    }
}
