export type WithChildren = {
    children?: React.ReactNode | React.ReactNode[];
};

export type NFTAsset = {
    id: number;
    tokenId: BigNumber;
    address: string;
    name: string;
    image: string;
    url: string;
};

export enum OptionFlavor {
    EUROPEAN,
    AMERICAN,
}

export enum OptionState {
    REQUEST,
    OPEN,
    CLOSED,
    WITHDRAWN,
}

export type Option = {
    id: number;
    buyer: string;
    seller: string;
    nftContract: string;
    nftId: BigNumber;
    startDate: string;
    interval: number;
    premium: string;
    strikePrice: string;
    flavor: OptionFlavor;
    state: OptionState;
};

import {BigNumber} from "ethers";

export interface Option_TEST_STRUCT {
    buyer: string;
    seller: string;
    nftContract: string;
    nftId: number;
    startDate: number;
    interval: number;
    premium: BigNumber;
    strikePrice: BigNumber;
    flavor: number;
    state: number;
}

export type OptionWithNFTDetails = Omit<Option, "nftContract" | "nftId"> & {asset: NFTAsset};
