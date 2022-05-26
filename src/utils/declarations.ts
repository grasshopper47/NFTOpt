export type WithChildren = {
    children?: React.ReactNode | React.ReactNode[];
};

export type NFTAsset = {
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
    interval: string;
    premium: string;
    strikePrice: string;
    flavor: OptionFlavor | null;
    state: OptionState | null;
};

export type OptionWithNFTDetails = Omit<Option, "nftContract" | "nftId"> & { asset: NFTAsset };
