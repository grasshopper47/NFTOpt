export type WithChildren = {
    children?: React.ReactNode | React.ReactNode[];
};

export type NFTAsset = {
    id: number;
    tokenId: string;
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
}

export type Option = {
    id: number;
    buyer: string;
    seller: string;
    nftContract: string;
    nftId: string;
    startDate: string;
    interval: number;
    premium: string;
    strikePrice: string;
    flavor: OptionFlavor;
    state: OptionState;
};

export type OptionWithNFTDetails = Omit<Option, "nftContract" | "nftId"> & { asset: NFTAsset };
