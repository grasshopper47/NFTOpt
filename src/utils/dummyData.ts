import {addDays} from "date-fns";
import {Option, OptionFlavor, OptionState} from "./declarations";

export const address0: string = "0x0000000000000000000000000000000000000000";
const dummyNFTAddress: string = "0x495f947276749ce646f68ac8c248420045cb7b5e";
const dummyNFTToken: string = "47074974716767716694905173572344578543308051858913198086517142061144583700481";

export const dummyOptions: Option[] = [
    // Request
    {
        id: "1",
        buyer: address0,
        seller: null,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: null,
        interval: addDays(new Date(), 4),
        premium: 0.1,
        strikePrice: 0.2,
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.REQUEST,
    },
    {
        id: "2",
        buyer: address0,
        seller: null,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: null,
        interval: addDays(new Date(), 4),
        premium: 0.1,
        strikePrice: 0.2,
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.REQUEST,
    },
    // Open
    {
        id: "3",
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date(),
        interval: addDays(new Date(), 4),
        premium: 0.1,
        strikePrice: 0.2,
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.OPEN,
    },
    {
        id: "4",
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date(),
        interval: addDays(new Date(), 4),
        premium: 0.1,
        strikePrice: 0.2,
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.OPEN,
    },
    // Closed
    {
        id: "5",
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date(),
        interval: addDays(new Date(), 4),
        premium: 0.1,
        strikePrice: 0.2,
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.CLOSED,
    },
    {
        id: "6",
        buyer: address0,
        seller: address0,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date(),
        interval: addDays(new Date(), 4),
        premium: 0.1,
        strikePrice: 0.2,
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.CLOSED,
    },
];
