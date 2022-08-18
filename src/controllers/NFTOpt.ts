import { BigNumber } from "ethers";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { contracts } from "../../datasources/NFTOpt";
import { blockNumber, setBlockNumber } from "../../datasources/blockNumber";
import { createOptionFromRequest, loadOptionWithAsset, withdrawRequest, cancelOption, exerciseOption } from "../../datasources/options";
import { eventLabels } from "../utils/labels";
import { dismissLastToast, TOAST_DURATION } from "../utils/toasting";
import toast from "react-hot-toast";
import { requestChangingIDs, optionChangingIDs } from "../utils/contexts";

export const setNFTOptUICallback   = (cb : () => void) => _UICallback = cb;
export const clearNFTOptUICallback = () => _UICallback = () => {};

export const attachNFTOptHandlersToInstance = (NFTOpt : NFTOpt) =>
{
    for (const event of eventLabels) NFTOpt.on(event, _handleEvent);
}

type BatchHandlerType =
{
    keys      : number[]
,   isLoading : boolean
,   handler   : (... any : any[]) => Promise<any>
}

let _UICallback : () => void;

const _createBatchHandler = ( handler : (... any : any[]) => Promise<any> ) =>
{
    return {
        keys      : [] as number[]
    ,   isLoading : false
    ,   handler   : handler
    } as BatchHandlerType;
}

const _batchHandlerCallback = async (obj : BatchHandlerType) =>
{
    let i = obj.keys.length;

    // Break when missing keys
    if (i === 0) return;

    obj.isLoading = true;

    // Load objects for each key
    const promises : Promise<any>[] = [];
    while (--i !== -1) promises.push( obj.handler(obj.keys.pop()) );
    await Promise.all(promises);

    obj.isLoading = false;

    // Check other handlers for activity
    let isBusy = false;
    for (const event of eventLabels) isBusy = isBusy || _handlers[event].isLoading;
    if (isBusy) { console.log("busy"); return; }

    console.log("batches loaded >> refresh");

    // Refresh UI
    _UICallback();
}

const _queueHandler = (ID : any, obj : BatchHandlerType) =>
{
    obj.keys.push(ID);

    if (obj.isLoading) return;

    setTimeout(() => _batchHandlerCallback(obj), 3000);
}

const _deleteRequestsChanging = (ID : number) => delete requestChangingIDs[ID];
const _deleteOptionsChanging  = (ID : number) => delete optionChangingIDs[ID];

const _handlers =
{
    Published : _createBatchHandler( (ID) => loadOptionWithAsset(contracts.NFTOpt, ID) )
,   Withdrawn : _createBatchHandler( (ID) => withdrawRequest(ID).then(_deleteRequestsChanging) )
,   Opened    : _createBatchHandler( (ID) => createOptionFromRequest(ID).then( () => { _deleteRequestsChanging(ID), _deleteOptionsChanging(ID); } ) )
,   Canceled  : _createBatchHandler( (ID) => cancelOption(ID).then(_deleteOptionsChanging) )
,   Exercised : _createBatchHandler( (ID) => exerciseOption(ID).then(_deleteOptionsChanging) )
};

const _handleEvent = (ID : BigNumber, transaction : any) =>
{
    // Some of the old events are re-emitted when the contract emits a new event after intitialization
    if (blockNumber >= transaction.blockNumber) return;
    setBlockNumber(transaction.blockNumber);

    const action = transaction.event[0];
    const id     = ID.toNumber();
    let actionLabel = transaction.event.toLowerCase();

    if (action === 'P' || action === 'W') actionLabel += " request";
    else                                  actionLabel += " option";

    // Show toast of success only when called by user's direct UI interaction (waiting toast is shown)
    if (dismissLastToast()) toast.success("Successfully " + actionLabel, { duration: TOAST_DURATION });

    console.log(actionLabel);

    _queueHandler(id, _handlers[transaction.event]);
}
