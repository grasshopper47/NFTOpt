export type WithChildren = {
    children?: React.ReactNode | React.ReactNode[];
};

export type NFTAsset = {
    id: string;
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
    id: string | null;
    buyer: string | null;
    seller: string | null;
    nftContract: string | null;
    nftId: string | null;
    startDate: Date | null;
    interval: Date | null;
    premium: number | null;
    strikePrice: number | null;
    flavor: OptionFlavor | null;
    state: OptionState | null;
};

export type OptionWithNFTDetails = Omit<Option, "nftContract" | "nftId"> & {asset: NFTAsset};
