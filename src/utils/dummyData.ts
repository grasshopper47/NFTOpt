import {Option, OptionFlavor, OptionState, NFTAsset} from "./types";
import addresses from "../../addresses.json";
import {addressEmpty} from "./constants";
import {BigNumber, ethers} from "ethers";

const dummyNFTAddress: string = addresses["localhost"].NFTDummy;
const dummyNFTToken: BigNumber = BigNumber.from("1");

export const dummyOptions: Option[] = [
    // Request
    {
        id: 1,
        buyer: addressEmpty,
        seller: null,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: null,
        interval: 4,
        premium: ethers.utils.parseEther("0.1"),
        strikePrice: BigNumber.from(2),
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.REQUEST,
    },
    {
        id: 2,
        buyer: addressEmpty,
        seller: null,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: null,
        interval: 4,
        premium: ethers.utils.parseEther("0.1"),
        strikePrice: BigNumber.from(2),
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.REQUEST,
    },
    // Open
    {
        id: 3,
        buyer: addressEmpty,
        seller: addressEmpty,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date().getUTCMilliseconds() / 1000,
        interval: 4,
        premium: ethers.utils.parseEther("0.1"),
        strikePrice: BigNumber.from(2),
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.OPEN,
    },
    {
        id: 4,
        buyer: addressEmpty,
        seller: addressEmpty,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date().getUTCMilliseconds() / 1000,
        interval: 4,
        premium: ethers.utils.parseEther("0.1"),
        strikePrice: BigNumber.from(2),
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.OPEN,
    },
    // Closed
    {
        id: 5,
        buyer: addressEmpty,
        seller: addressEmpty,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date().getUTCMilliseconds() / 1000,
        interval: 4,
        premium: ethers.utils.parseEther("0.1"),
        strikePrice: BigNumber.from(2),
        flavor: OptionFlavor.AMERICAN,
        state: OptionState.CLOSED,
    },
    {
        id: 6,
        buyer: addressEmpty,
        seller: addressEmpty,
        nftContract: dummyNFTAddress,
        nftId: dummyNFTToken,
        startDate: new Date().getUTCMilliseconds() / 1000,
        interval: 4,
        premium: ethers.utils.parseEther("0.1"),
        strikePrice: BigNumber.from(2),
        flavor: OptionFlavor.EUROPEAN,
        state: OptionState.CLOSED,
    },
];
