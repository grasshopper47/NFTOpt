import { NFTOpt } from "../../typechain-types";
import { NFTAsset, Option, OptionWithAsset, Option_SOLIDITY } from "./types";
import { ADDRESS0, BIGNUMBER0, ABIs, SECONDS_IN_A_DAY } from "./constants";
import { getSignedContract } from "./metamask";

function isValid(option: Option_SOLIDITY)
    : boolean
{
    return  option.buyer !== ADDRESS0
            && option.nftContract !== ADDRESS0
            && option.nftId !== BIGNUMBER0
            && option.premium !== BIGNUMBER0
            && option.strikePrice !== BIGNUMBER0
            && option.interval !== 0
    ;
}

export const loadOption =
    async (contract: NFTOpt, id: number)
    : Promise<Option> =>
{
    const optionSolidity = await contract.options(id) as unknown as Option_SOLIDITY;

    if (!isValid(optionSolidity)) throw "Invalid option data received!";

    const option: Option =
    {
        id: id
    ,   ...optionSolidity
    };

    option.buyer = option.buyer.toLowerCase();
    option.seller = option.seller.toLowerCase();
    option.interval = option.interval / SECONDS_IN_A_DAY;

    return option;
}

const NFTContractABI =
[
    ABIs.ERC721.name,
,   ABIs.ERC721.tokenURI
];

export const loadAsset =
    async (option: Option)
    : Promise<NFTAsset> =>
{
    const NFTContract = getSignedContract(option.nftContract, NFTContractABI);

    const promises =
    [
        /* name  */ NFTContract.name().then(r => r + " - " + option.nftId.toString())
    ,   /* image */ NFTContract.tokenURI(option.nftId).then(r => JSON.parse(atob(r.slice(29))).image)
    ];

    await Promise.allSettled(promises);

    return {
        id      : option.id
    ,   tokenId : option.nftId
    ,   address : option.nftContract
    ,   name    : await promises[0]
    ,   image   : await promises[1]
    };
}

export const loadOptionWithAsset =
    async(contract: NFTOpt, id: number)
    : Promise<OptionWithAsset> =>
{
    const option = await loadOption(contract, id);

    return {
        ...option
    ,   asset: await loadAsset(option)
    }
}

async function _loadOptions
(
    contract: NFTOpt
,   cb: (contract: NFTOpt, id:number) => Promise<any>
)
: Promise<Option[] | OptionWithAsset[]>
{
    const optionIDPromise = await contract.optionID();
    if (!optionIDPromise) return [];

    const options  : any[]          = [];
    const promises : Promise<any>[] = [];

    // TODO: handle optionsLength > 2^53
    const optionsLength = optionIDPromise.toNumber();

    let id = -1;
    while (++id !== optionsLength)
    {
        promises.push
        (
            cb(contract, id)
            .then( o => options.push(o) )
            .catch( () => console.log(`Option ${id} failed to fetch`) )
        );
    }

    await Promise.allSettled(promises);

    return options.sort( o => o.id );
}

export async function loadAllOptions(contract: NFTOpt)
    : Promise<Option[]>
{
    return _loadOptions(contract, loadOption) as Promise<Option[]>;
}

export async function loadAllOptionsWithAsset(contract: NFTOpt)
    : Promise<OptionWithAsset[]>
{
    return _loadOptions(contract, loadOptionWithAsset) as Promise<OptionWithAsset[]>;
}