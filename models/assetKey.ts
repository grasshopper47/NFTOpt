export type AssetKey =
{
    nftId       : string
,   nftContract : string
};

export const isValid = (key : AssetKey) =>
{
    return key.nftContract.length === 42
        && key.nftContract.slice(0,2) =="0x"
        && key.nftId !== ""
};

export const stringOf = (key : AssetKey)  => key.nftId + "_" + key.nftContract;
