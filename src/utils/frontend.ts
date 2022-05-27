import { BigNumber, ethers } from "ethers";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { NFTAsset, Option, OptionWithNFTDetails } from "./types";
import { addressEmpty, SECONDS_IN_A_DAY } from "./constants";
import addresses from "../../addresses.json";

declare var window: Window & {
    ethereum: any;
};

export function getEthereumObject() {
    const { ethereum } = window;

    return ethereum ?? null;
}

export function setupEthereumEventListeners(ethereum: ethers.providers.ExternalProvider) {
    const provider = new ethers.providers.Web3Provider(ethereum, "any");

    provider.on("network", (newNetwork, oldNetwork) => {
        if (oldNetwork) {
            window.location.reload();
        }
    });

    window.ethereum.on("accountsChanged", async () => {
        window.location.reload();
    });

    return ethereum;
}

export async function getCurrentAccount() {
    const { ethereum } = window;

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (!accounts || accounts?.length === 0) {
        return null;
    }

    const account = accounts[0];

    return account;
}

export async function connectWallet(setAccountCallback: (account: string) => void) {
    const ethereum = getEthereumObject();

    if (ethereum) {
        ethereum.request({ method: "eth_requestAccounts" }).then((res) => setAccountCallback(res[0]));
    } else {
        alert("Please install MetaMask extension");
    }
}

export function getSignedContract(address: string, abi: any) {
    const { ethereum } = window;

    const provider = new ethers.providers.Web3Provider(ethereum, "any");

    const signer = provider.getSigner();

    return new ethers.Contract(address, abi, signer);
}

async function fetchNFTImage(address: string, id: BigNumber) {
    const abi_IERC721: any = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }];

    let NFTContract = getSignedContract(address, abi_IERC721);

    var data = await NFTContract.tokenURI(id);

    return JSON.parse(atob(data.slice(29))).image;
}

export async function fetchAssetsForAddress(account: string, setAssetsCallback: (assets: NFTAsset[]) => void) {
    const assets: NFTAsset[] = [];

    // await fetch(`https://api.opensea.io/api/v1/assets?owner=${account}&limit=30`)
    //     .then((res) => res.json())
    //     .then((res) => {
    //         if (!res.assets) {
    //             return;
    //         }
    //         for (let asset of res.assets) {
    //             assets.push({
    //                 tokenId: asset.token_id,
    //                 address: asset.asset_contract.address,
    //                 name: asset.name,
    //                 image: asset.image_preview_url,
    //                 url: asset.permalink,
    //             });
    //         }
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });

    const abi_IERC721: any = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "ownerOf",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }];

    const NFTContractAddress = addresses["localhost"].NFTDummy;
    let NFTContract = getSignedContract(NFTContractAddress, abi_IERC721);

    for (let i = 1; i < 21; ++i) {
        var data = await NFTContract.ownerOf(i);

        data = data.toLowerCase();

        if (data === account) {
            assets.push({
                tokenId: BigNumber.from(i),
                address: NFTContractAddress,
                name: "X Collection - " + i,
                image: await fetchNFTImage(NFTContractAddress, BigNumber.from(i)),
                url: "",
            });
        }
    }

    setAssetsCallback(assets);
}

export async function fetchNFTDetailsForOneOptions(
    nftContract: string,
    nftTokenId: BigNumber,
    setAssetCallback: (asset: NFTAsset) => void
) {
    let asset: NFTAsset | null = null;

    asset = {
        tokenId: nftTokenId,
        address: nftContract,
        name: "???",
        image: await fetchNFTImage(nftContract, nftTokenId),
        url: "https://freesvg.org/img/Placeholder.png",
    };

    // await fetch(`https://api.opensea.io/api/v1/asset/${nftContract}/${nftTokenId}/`)
    //     .then((res) => res.json())
    //     .then((res) => {
    //         if (!res) {
    //             return;
    //         }
    //         asset = {
    //             tokenId: nftTokenId,
    //             address: nftContract,
    //             name: res.name,
    //             image: res.image_preview_url,
    //             url: res.permalink,
    //         };
    //     })
    //     .catch((error) => {
    //         console.error(error);
    //     });

    setAssetCallback(asset);
}

export async function fetchNFTDetailsForMultipleOptions(
    options: Option[],
    setOptionsCallback: (optionsWithNFTDetails: OptionWithNFTDetails[]) => void
) {
    const optionsWithNFTDetails: OptionWithNFTDetails[] = [];
    let asset: NFTAsset | null = null;

    const abi_IERC721: any = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "tokenId",
                    "type": "uint256"
                }
            ],
            "name": "tokenURI",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }];

    for (let option of options) {

        asset = {
            tokenId: option.nftId,
            address: option.nftContract,
            name: `Option ${option.id}`,
            image: await fetchNFTImage(option.nftContract, option.nftId),
            url: "https://freesvg.org/img/Placeholder.png",
        };

        optionsWithNFTDetails.push({
            ...option,
            asset,
        });
        // await fetch(`https://api.opensea.io/api/v1/asset/${option.nftContract}/${option.nftId}/`)
        //     .then((res) => res.json())
        //     .then((res) => {
        //         if (!res) {
        //             return;
        //         }
        //         asset = {
        //             tokenId: option.nftId,
        //             address: option.nftContract,
        //             name: res.name,
        //             image: res.image_preview_url,
        //             url: res.permalink,
        //         };
        //         optionsWithNFTDetails.push({
        //             ...option,
        //             asset,
        //         });
        //     })
        //     .catch((error) => {
        //         console.error(error);
        //     });
    }

    setOptionsCallback(optionsWithNFTDetails);
}

export function getAccountDisplayValue(account: string) {
    return account?.slice(0, 6) + "..." + account?.slice(-4);
}

function checkOptionExists(option: Option): boolean {
    if (
        option.buyer === addressEmpty ||
        option.nftContract === addressEmpty ||
        option.nftId === BigNumber.from("0") ||
        option.nftId === undefined ||
        option.premium === "0" ||
        option.strikePrice === "0" ||
        option.interval === 0
    ) {
        return false;
    }
    return true;
}

export async function loadContractOptions(contract: NFTOpt, setOptionsCallback: (options: Option[]) => void) {
    let options: Option[] = [];
    try {
        let optionIDPromise = await contract.optionID();

        if (optionIDPromise === undefined) {
            return;
        }

        const optionsLength = optionIDPromise.toNumber();
        for (let optionId = 0; optionId <= optionsLength; ++optionId) {
            const contractOption = await contract.options(optionId);
            const option: Option = {
                id: optionId,
                buyer: contractOption.buyer.toLowerCase(),
                seller: contractOption.seller.toLowerCase(),
                flavor: contractOption.flavor,
                interval: contractOption.interval / SECONDS_IN_A_DAY,
                nftContract: contractOption.nftContract,
                nftId: contractOption.nftId,
                premium: ethers.utils.formatEther(contractOption.strikePrice).toString(),
                startDate: contractOption.startDate.toString(),
                state: contractOption.state,
                strikePrice: ethers.utils.formatEther(contractOption.strikePrice).toString(),
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
