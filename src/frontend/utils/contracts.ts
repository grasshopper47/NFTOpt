import { BigNumber, ethers } from "ethers";
import toast from "react-hot-toast";
import addresses from "../../../addresses.json";
import NFTOptSolContract from "../../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { network, provider } from "./metamask";
import { cancelOption, exerciseOption, optionChangingIDs } from "../../datasources/options";
import { createOptionFromRequest, loadRequestAsOptionWithAsset, requestChangingIDs, withdrawRequest } from "../../datasources/requests";
import { NFTOpt } from "../../../typechain-types";
import { stateLabels } from "./labels";
import { dismissLastToast, TOAST_DURATION } from "./toasting";
import { contracts } from "../../datasources/NFTOpt";

let blockNumber = ~0;

let requestsUpdated : () => void;
let optionsUpdated : () => void;

export const requestIDsTransactions = {};
export const optionIDsTransactions  = {};

export const setRequestUpdatedCallback = (cb : () => void) => requestsUpdated = cb;
export const setOptionsUpdatedCallback = (cb : () => void) => optionsUpdated = cb;

const onEndUpdateRequest = (ID: number) =>
{
    delete requestChangingIDs[ID];

    requestsUpdated();
}

const onEndUpdateOption = (ID: number) =>
{
    delete optionChangingIDs[ID];

    optionsUpdated();
}

const eventHandlers =
{
    "Published" :
    {
        hashlogs : requestIDsTransactions
    ,   method   : (ID: number) => loadRequestAsOptionWithAsset(ID).then(requestsUpdated)
    ,   action   : "published request"
    }
,   "Withdrawn" :
    {
        hashlogs : requestIDsTransactions
    ,   method   : (ID: number) => withdrawRequest(ID).then(onEndUpdateRequest)
    ,   action   : "withdrawn request"
    }
,   "Opened" :
    {
        hashlogs : optionIDsTransactions
    ,   method   : (rID : number, oID : number) => createOptionFromRequest(rID, oID).then(onEndUpdateRequest).then(optionsUpdated)
    ,   action   : "opened option"
    }
,   "Canceled" :
    {
        hashlogs : optionIDsTransactions
    ,   method   : (ID: number) => cancelOption(ID).then(onEndUpdateOption)
    ,   action   : "canceled option"
    }
,   "Exercised" :
    {
        hashlogs : optionIDsTransactions
    ,   method   : (ID: number) => exerciseOption(ID).then(onEndUpdateOption)
    ,   action   : "exercised option"
    }
}

const handleEvent = (ID : BigNumber, transaction : any) =>
{
    // Some of the old events are re-emitted when the contract emits a new event after intitialization
    if (blockNumber >= transaction.blockNumber) return;

    blockNumber = transaction.blockNumber;

    let action = eventHandlers[transaction.event].action;

    // Show toast of success only when called by the user action (already a toast in progress)
    if (dismissLastToast()) toast.success("Successfully " + action, { duration: TOAST_DURATION });

    console.log(action);

    let id = ID.toNumber();
    let handler = eventHandlers[action.state];

    // Store hash in logs
    if (action[0] === 'W') delete handler.hashlogs[id];
    else handler.hashlogs[id] = transaction.transactionHash;

    if (action[0] !== 'O') { handler.method(id); return; }

    transaction.getTransaction()
    .then
    (
        tx =>
        {
            // extract request ID from transaction input data (createOption called with requestID)
            let requestID = BigNumber.from("0x" + tx.data.slice(10)).toNumber();

            handler.method(requestID, id);
        }
    );
}

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
    for (let event of stateLabels) contracts.NFTOpt.on(event, handleEvent);
}