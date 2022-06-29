import { BigNumber } from "ethers";
import { NFTAsset } from "./nftAsset";
import { Option, OptionState } from "./option";
import { OptionRequest } from "./optionRequest";

export type Option_SOLIDITY =
{
    request   : OptionRequest

    seller    : string
    state     : OptionState
    startDate : BigNumber
};

export type OptionRequest_DISPLAY = Omit<OptionRequest, "buyer" | "interval" | "premium" | "strikePrice">
& { interval : string, premium : string, strikePrice : string };

export type OptionWithAsset = Omit<Option, "nftContract" | "nftId"> & { asset: NFTAsset };