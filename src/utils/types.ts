import { BigNumber } from "ethers";

export type WithChildren = {
    children?: React.ReactNode | React.ReactNode[];
};

export type NFTAsset = {
    id: number,
    tokenId: BigNumber;
    address: string;
    name: string;
    image: string;
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

export enum OptionFilterOwnership {
    ALL,
    PERSONAL,
}

export type Option = {
    id: number;
    buyer: string;
    seller: string;
    nftContract: string;
    nftId: BigNumber;
    startDate: number;
    interval: number;
    premium: BigNumber;
    strikePrice: BigNumber;
    flavor: OptionFlavor;
    state: OptionState;
};

export interface Option_SOLIDITY {
    buyer: string;
    seller: string;
    nftContract: string;
    nftId: BigNumber;
    startDate: number;
    interval: number;
    premium: BigNumber;
    strikePrice: BigNumber;
    flavor: OptionFlavor;
    state: OptionState;
}

export type OptionWithAsset = Omit<Option, "nftContract" | "nftId"> & { asset: NFTAsset };
