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
