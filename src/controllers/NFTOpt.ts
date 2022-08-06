import { BigNumber } from "ethers";
import { cancelOption, exerciseOption } from "../../datasources/options";
import { createOptionFromRequest, loadOne, withdrawRequest } from "../../datasources/options";
import { dismissLastToast, TOAST_DURATION } from "../utils/toasting";
import { optionChangingIDs, requestChangingIDs } from "../pages/_app";
import toast from "react-hot-toast";
import { NFTOpt } from "../../typechain-types/contracts/NFTOpt";
import { eventLabels } from "../utils/labels";
import { blockNumber, setBlockNumber } from "../../datasources/blockNumber";
import { contracts } from "../../datasources/NFTOpt";

export const requestIDsTransactions = {};
export const optionIDsTransactions  = {};

export const attachNFTOptHandlersToInstance =
(
    NFTOpt : NFTOpt
,   UICallback : () => void
) =>
{
    _UICallback = UICallback;

    for (let event of eventLabels) NFTOpt.on(event, _handleEvent);
}

type BatchFlagsType =
{
    isLoading : boolean
,   isWaiting : boolean
}

type BatchHandlerType =
{
    keys     : any[]
,   flags    : BatchFlagsType
,   handler  : (... any : any[]) => Promise<any>
,   callback : (... any : any[]) => void
}

const _createBatchFlagsType = () =>
{
    return {
        isLoading : false
    ,   isWaiting : false
    } as BatchFlagsType;
}

const _createBatchHandler = ( handler  : (... any : any[]) => Promise<any> ) =>
{
    return {
        keys     : [] as number[]
    ,   flags    : _createBatchFlagsType()
    ,   handler  : handler
    ,   callback : _UpdateUI
    } as BatchHandlerType;
}

const _batchHandlerCallback = async (obj : BatchHandlerType) =>
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

const _queueHandler = (ID : any, obj : BatchHandlerType) =>
{
    while (obj.flags.isLoading) continue;

    obj.keys.push(ID);

    if (obj.flags.isWaiting) return;

    obj.flags.isWaiting = true;
    setTimeout(() => _batchHandlerCallback(obj), 3000);
}

const _deleteRequestChangingID = (ID : number) => delete requestChangingIDs[ID];
const _deleteOptionChangingID  = (ID : number) => delete optionChangingIDs[ID];

let _UICallback : () => void;
const _UpdateUI = () => _UICallback();

const _handlers =
{
    Published : _createBatchHandler( (ID) => loadOne(contracts.NFTOpt, ID) )
,   Withdrawn : _createBatchHandler( (ID) => withdrawRequest(ID).then(_deleteRequestChangingID) )
,   Opened    : _createBatchHandler( (ID) => createOptionFromRequest(ID).then(_deleteRequestChangingID) )
,   Canceled  : _createBatchHandler( (ID) => cancelOption(ID).then(_deleteOptionChangingID) )
,   Exercised : _createBatchHandler( (ID) => exerciseOption(ID).then(_deleteOptionChangingID) )
};

const _handleEvent = (ID : BigNumber, transaction : any) =>
{
    // Some of the old events are re-emitted when the contract emits a new event after intitialization
    if (blockNumber >= transaction.blockNumber) return;
    setBlockNumber(transaction.blockNumber);

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

    _queueHandler(id, _handlers[transaction.event]);
}
