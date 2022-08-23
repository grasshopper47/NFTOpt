import { BigNumber } from "ethers";
import { assetsOf, getAsset } from "../../datasources/assets";
import { blockNumber, setBlockNumber } from "../../datasources/blockNumber";
import { signer } from "../utils/metamask";
import { dismissLastToast, TOAST_DURATION } from "../utils/toasting";
import toast from "react-hot-toast";

export const setNFTCollectionsEventCallback   = (cb : () => void) => _UICallback = cb;
export const clearNFTCollectionsEventCallback = () => _UICallback = () => {};

let _UICallback = () => {};

export const attachNFTCollectionsHandlersToInstances = (collections : {}) =>
{
    const names = Object.keys(collections);
    for (const n of names)
    {
        collections[n].on
        (
            "Transfer"
        ,   async (from: string, to: string, tokenID: BigNumber, transaction : any) =>
            {
                // Some of the old events are re-emitted when the contract emits a new event after intitialization
                if (blockNumber >= transaction.blockNumber || tokenID.toString() === "9999" ) return;
                setBlockNumber(transaction.blockNumber);

                // Show toast of success only when called by the user actionLabel (already a toast in progress)
                if (dismissLastToast()) toast.success("Successfully minted NFT", { duration: TOAST_DURATION });
                console.log("NFT minted");

                const promises =
                [
                    getAsset({ nftContract : transaction.address, nftId : tokenID.toString() })
                    .then( asset => assetsOf(to).push(asset) )
                ,   signer.getAddress()
                ];

                await Promise.all(promises);

                if (to === await promises[1]) _UICallback();
            }
        );
    }
}
