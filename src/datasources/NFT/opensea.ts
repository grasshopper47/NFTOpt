import { BigNumber } from "ethers";
import { NFTAsset, Option, OptionWithAsset } from "../../utils/types";

export async function fetchAssetsOfAccount(account: string, setAssetsCallback: (assets: NFTAsset[]) => void) {
    const assets: NFTAsset[] = [];

    await fetch(`https://api.opensea.io/api/v1/assets?owner=${account}&limit=30`)
        .then((res) => res.json())
        .then((res) => {
            if (!res.assets) {
                return;
            }
            for (let asset of res.assets) {
                assets.push({
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
    nftTokenId: BigNumber,
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
    setOptionsCallback: (optionsWithAsset: OptionWithAsset[]) => void
) {
    const optionsWithAsset: OptionWithAsset[] = [];
    let asset: NFTAsset | null = null;

    for (let option of options) {
        await fetch(`https://api.opensea.io/api/v1/asset/${option.nftContract}/${option.nftId}/`)
            .then((res) => res.json())
            .then((res) => {
                if (!res) {
                    return;
                }
                asset = {
                    tokenId: option.nftId,
                    address: option.nftContract,
                    name: res.name,
                    image: res.image_preview_url,
                    url: res.permalink,
                };
                optionsWithAsset.push({
                    ...option,
                    asset,
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }

    setOptionsCallback(optionsWithAsset);
}