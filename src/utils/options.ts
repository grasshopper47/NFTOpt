import { BigNumber } from "ethers";
import { NFTOpt } from "../../typechain-types";
import { NFTAsset, Option, OptionWithAsset, Option_SOLIDITY } from "./types";
import { ADDRESS0, ABIs, SECONDS_IN_A_DAY } from "./constants";
import { getSignedContract } from "./metamask";

function isOptionValid(option: any): boolean {
    return !(
        option.buyer === ADDRESS0 ||
        option.nftContract === ADDRESS0 ||
        option.nftId === BigNumber.from("0") ||
        option.nftId === undefined ||
        option.premium === "0" ||
        option.strikePrice === "0" ||
        option.interval === 0
    );
}

export async function loadOption(contract: NFTOpt, id: number) : Promise<Option | null> {
    const optionSolidity = await contract.options(id) as unknown as Option_SOLIDITY;

    if (!isOptionValid(optionSolidity)) { return null; }

    const option: Option = {
        id: id,
        ...optionSolidity,
    };

    option.buyer = option.buyer.toLowerCase();
    option.seller = option.seller.toLowerCase();
    option.interval = option.interval / SECONDS_IN_A_DAY;

    return option;
}

export async function loadOptions(contract: NFTOpt): Promise<Option[]> {
    let options: Option[] = [];

    const optionIDPromise = await contract.optionID();

    if (!optionIDPromise) { return options; }

    // TODO: handle optionsLength > 2^53
    const optionsLength = optionIDPromise.toNumber();

    for (let id = 1; id <= optionsLength; ++id) {
        const optionSolidity = await contract.options(id) as unknown as Option_SOLIDITY;
        if (!isOptionValid(optionSolidity)) { continue; }

        const option = await loadOption(contract, id);
        if (!option) { continue; }

        options.push(option);
    }

    return options;
}

export async function loadAssetForOption(option: Option): Promise<NFTAsset>
{
    console.log("loadAssetForOption");

    const NFTContract = getSignedContract(option.nftContract, [ ABIs.ERC721.name, ABIs.ERC721.tokenURI ]);

    const promises = [
        /* name  */ NFTContract.name().then(r => r + " - " + option.nftId.toString())
    ,   /* image */ NFTContract.tokenURI(option.nftId).then(r => JSON.parse(atob(r.slice(29))).image)
    ];

    return {
        id      : option.id,
        tokenId : option.nftId,
        address : option.nftContract,
        name    : await promises[0],
        image   : await promises[1],
    };
}

export async function loadOptionWithAssetDetails(contract: NFTOpt, id: number): Promise<OptionWithAsset | null>
{
    console.log("loadOptionWithAssetDetails");

    const option : Option | null = await loadOption(contract, id);
    if (!option) { return option; }

    return {
        ...option,
        asset: await loadAssetForOption(option),
    }
}

export async function loadOptionsWithAsset(contract: NFTOpt): Promise<OptionWithAsset[]>
{
    console.log("loadOptionsWithAsset");

    const options: OptionWithAsset[] = [];

    const optionIDPromise = await contract.optionID();
    if (!optionIDPromise) { return options; }

    // TODO: handle optionsLength > 2^53
    const optionsLength = optionIDPromise.toNumber();

    const promises : Promise<any>[] = [];

    for (let id = 0; id !== optionsLength; ++id)
    {
        const fetchAndStoreOptionWithDetails = async () =>
        {
            const option = await loadOption(contract, id);
            if (!option) { return; }

            const _asset = await loadAssetForOption(option);

            options.push({...option, asset: _asset});
        };

        promises.push(fetchAndStoreOptionWithDetails());
    }

    await Promise.allSettled(promises);

    return options;
}