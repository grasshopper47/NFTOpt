import { addDays } from "date-fns";
import { Option, OptionFlavor, OptionState, NFTAsset } from "./declarations";

export const address0: string = "0x0000000000000000000000000000000000000000";
const dummyNFTAddress: string = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const dummyNFTToken: string = "1";

export const dummyNFT: NFTAsset = {
    id: 0,
    name: "BoredApe #12470",
    address: dummyNFTAddress,
    tokenId: dummyNFTToken,
    url: "https://opensea.io/assets/ethereum/0x495f947276749ce646f68ac8c248420045cb7b5e/47074974716767716694905173572344578543308051858913198086517142061144583700481",
    image: "https://lh3.googleusercontent.com/YC24jMQToLKgBaqlNhVHrrwLHGKWo8hZubnTF1pyWMz-ZRFj-ciCUN0I2lseIBf92DtApMod9G13H_LUWGrArrAHJ9t9vuTeHRexBw=s250",
};

export const dummyOptions: Option[] = [
    // Request
    {
        id: 1,
        buyer: address0,
        seller: null,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: null,
        interval: 4,
        premium: "0.1",
        strikePrice: "2",
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.REQUEST,
    },
    {
        id: 2,
        buyer: address0,
        seller: null,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: null,
        interval: 4,
        premium: "0.1",
        strikePrice: "2",
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.REQUEST,
    },
    // Open
    {
        id: 3,
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: (new Date().getUTCMilliseconds() / 1000).toString(),
        interval: 4,
        premium: "0.1",
        strikePrice: "2",
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.OPEN,
    },
    {
        id: 4,
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: (new Date().getUTCMilliseconds() / 1000).toString(),
        interval: 4,
        premium: "0.1",
        strikePrice: "2",
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.OPEN,
    },
    // Closed
    {
        id: 5,
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: (new Date().getUTCMilliseconds() / 1000).toString(),
        interval: 4,
        premium: "0.1",
        strikePrice: "2",
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.CLOSED,
    },
    {
        id: 6,
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: (new Date().getUTCMilliseconds() / 1000).toString(),
        interval: 4,
        premium: "0.1",
        strikePrice: "2",
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.CLOSED,
    },
];
