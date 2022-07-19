import { BigNumber, ethers } from "ethers";
import addresses from "../../addresses.json";
import { NFTOpt } from "../../typechain-types";
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { contracts } from "../../datasources/NFTOpt";
import { cancelOption, exerciseOption, optionChangingIDs } from "../../datasources/options";
import { createOptionFromRequest, loadRequestAsOptionWithAsset, requestChangingIDs, RequestOptionIDType, withdrawRequest } from "../../datasources/requests";
import { eventLabels } from "./labels";
import { network, provider } from "./metamask";
import { dismissLastToast, TOAST_DURATION } from "./toasting";
import toast from "react-hot-toast";

export const requestIDsTransactions = {};
export const optionIDsTransactions  = {};

export const setRequestUpdatedCallback = (cb : () => void) => requestsUICallback = cb;
export const setOptionsUpdatedCallback = (cb : () => void) => optionsUICallback = cb;

export const createNFTOptInstance = () =>
{
    let provider_ = provider();

    provider_.getBlockNumber().then(r => blockNumber = r);

    // Create completely new instance with the default provider (readonly)
    contracts.NFTOpt =
    new ethers.Contract
    (
        addresses[network()].NFTOpt
    ,   NFTOptSolContract.abi
    ,   provider_
    ) as NFTOpt;

    // Subscribe to events
    for (let event of eventLabels) contracts.NFTOpt.on(event, handleEvent);
}

let blockNumber = ~0;

let requestsUICallback : () => void;
let optionsUICallback  : () => void;

type BatchFlagsType =
{
    isLoading : boolean
,   isWaiting : boolean
}

type BatchHandlerType =
{
    keys      : any[]
,   flags     : BatchFlagsType
,   handler   : (... any : any[]) => Promise<any>
,   callback  : (... any : any[]) => void
}

const createBatchFlagsType = () =>
{
    return {
        isLoading : false
    ,   isWaiting : false
    } as BatchFlagsType;
}

const createBatchHandler =
(
    keys     : any[]
,   handler  : (... any : any[]) => Promise<any>
,   callback : (... any : any[]) => void
) =>
{
    return {
        keys      : keys
    ,   flags    : createBatchFlagsType()
    ,   handler  : handler
    ,   callback : callback
    } as BatchHandlerType;
}

const batchHandlerCallback = async (obj : BatchHandlerType) =>
{
    let i = obj.keys.length;
    if (i === 0)
    {
        obj.flags.isWaiting = false;
        return;
    }

    obj.flags.isLoading = true;

    let promises : Promise<any>[] = [];
    while (--i !== -1) promises.push( obj.handler(obj.keys.pop()) );

    await Promise.allSettled(promises);

    obj.callback();

    obj.flags.isLoading = false;
    obj.flags.isWaiting = false;
}

const queueHandler = (ID : any, obj : BatchHandlerType) =>
{
    while (obj.flags.isLoading) continue;

    obj.keys.push(ID);

    if (obj.flags.isWaiting) return;

    obj.flags.isWaiting = true;
    setTimeout(() => batchHandlerCallback(obj), 3000);
}

const deleteRequestChangingID = (ID : number) => delete requestChangingIDs[ID];
const deleteOptionChangingID  = (ID : number) => delete optionChangingIDs[ID];

const requestsUpdater = () => requestsUICallback();
const optionsUpdater  = () => optionsUICallback();

const handlers =
{
    Published : createBatchHandler
    (
        [] as number[]
    ,   loadRequestAsOptionWithAsset
    ,   requestsUpdater
    )

,   Withdrawn : createBatchHandler
    (
        [] as number[]
    ,   (ID) => withdrawRequest(ID).then(deleteRequestChangingID)
    ,   requestsUpdater
    )

,   Opened: createBatchHandler
    (
        [] as RequestOptionIDType[]
    ,   (ID) => createOptionFromRequest(ID).then( (ID) => deleteRequestChangingID(ID.request) )
    ,   optionsUpdater
    )

,   Canceled : createBatchHandler
    (
        [] as number[]
    ,   (ID) => cancelOption(ID).then(deleteOptionChangingID)
    ,   optionsUpdater
    )

,   Exercised : createBatchHandler
    (
        [] as number[]
    ,   (ID) => exerciseOption(ID).then(deleteOptionChangingID)
    ,   optionsUpdater
    )
};

const handleEvent = (ID : BigNumber, transaction : any) =>
{
    // Some of the old events are re-emitted when the contract emits a new event after intitialization
    if (blockNumber >= transaction.blockNumber) return;

    blockNumber = transaction.blockNumber;

    let action = transaction.event[0];
    let actionLabel = transaction.event.toLowerCase();
    let id = ID.toNumber();

    if (action === 'P' || action === 'W')
    {
        actionLabel += " request";

        if (action === 'W') delete requestIDsTransactions[id];
        else                requestIDsTransactions[id] = transaction.transactionHash;
    }
    else
    {
        actionLabel += " option";

        optionIDsTransactions[id] = transaction.transactionHash;
    }

    // Show toast of success only when called by the user actionLabel (already a toast in progress)
    if (dismissLastToast()) toast.success("Successfully " + actionLabel, { duration: TOAST_DURATION });

    console.log(actionLabel);

    // Queue execution of expected handler
    let handler = handlers[transaction.event];

    if (action !== 'O') { queueHandler(id, handler); return; }

    transaction.getTransaction()
    .then
    (
        tx =>
        {
            // extract request ID from transaction input data (createOption called with requestID)
            let rid = BigNumber.from("0x" + tx.data.slice(10)).toNumber();

            queueHandler({ request : rid, option : id }, handler);
        }
    );
}
