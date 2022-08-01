import { BigNumber } from "ethers";
import toast from "react-hot-toast";
import { addAssetByKeyTo } from "../../datasources/assets";
import { blockNumber, setBlockNumber } from "../../datasources/blockNumber";
import { signer } from "../utils/metamask";
import { dismissLastToast, TOAST_DURATION } from "../utils/toasting";

let _assetsUICallback : () => void;

export const setAssetsUICallback = (cb : () => void) => _assetsUICallback = cb;

export const attachNFTOptCollectionHandlersToInstance = (collections : {}) =>
{
    let collectionKeys = Object.keys(collections);
    for (let k of collectionKeys)
    {
        collections[k].on
        (
            "Transfer"
        ,   async (from: string, to: string, tokenID: BigNumber, transaction : any) =>
            {
                // Some of the old events are re-emitted when the contract emits a new event after intitialization
                if (blockNumber >= transaction.blockNumber || tokenID.toString() === "9999" ) return;
                setBlockNumber(transaction.blockNumber);

                let address = await signer().getAddress();

                await addAssetByKeyTo
                (
                    address.toLowerCase()
                ,   { nftContract : transaction.address, nftId : tokenID.toString() }
                );

                // Show toast of success only when called by the user actionLabel (already a toast in progress)
                if (dismissLastToast()) toast.success("Successfully minted NFT", { duration: TOAST_DURATION });

                console.log("Minted NFT");

                if (address === to) _assetsUICallback();
            }
        );
    }
}
