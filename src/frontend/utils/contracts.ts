import { BigNumber, ethers } from "ethers";
import toast from "react-hot-toast";
import addresses from "../../../addresses.json";
import NFTOptSolContract from "../../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import { network, provider } from "./metamask";
import { cancelOption, exerciseOption, optionChangingIDs } from "../../datasources/options";
import { createOptionFromRequest, loadRequestAsOptionWithAsset, requestChangingIDs, withdrawRequest } from "../../datasources/requests";
import { NFTOpt } from "../../../typechain-types";
import { eventLabels } from "./labels";
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

const handlers =
{
    Published : (ID: number) => loadRequestAsOptionWithAsset(ID).then(requestsUpdated)
,   Withdrawn : (ID: number) => withdrawRequest(ID).then(onEndUpdateRequest)
,   Opened    : (rID : number, oID : number) => createOptionFromRequest(rID, oID).then(onEndUpdateRequest).then(optionsUpdated)
,   Canceled  : (ID: number) => cancelOption(ID).then(onEndUpdateOption)
,   Exercised : (ID: number) => exerciseOption(ID).then(onEndUpdateOption)
}

const handleEvent = (ID : BigNumber, transaction : any) =>
{
    // Some of the old events are re-emitted when the contract emits a new event after intitialization
    if (blockNumber >= transaction.blockNumber) return;

    blockNumber = transaction.blockNumber;

    let hashlogs : any;
    let action = transaction.event[0];
    let actionLabel = transaction.event.toLowerCase() + " ";

    if (action === 'P' || action === 'W')
    {
        actionLabel += "request"
        hashlogs = requestIDsTransactions;
    }
    else
    {
        actionLabel += "option"
        hashlogs = optionIDsTransactions;
    }

    // Show toast of success only when called by the user actionLabel (already a toast in progress)
    if (dismissLastToast()) toast.success("Successfully " + actionLabel, { duration: TOAST_DURATION });

    console.log(actionLabel);

    let id = ID.toNumber();

    // Store hash in logs
    if (action === 'W') delete hashlogs[id];
    else hashlogs[id] = transaction.transactionHash;

    // Execute expected handler
    let handler = handlers[transaction.event];

    if (action !== 'O') { handler(id); return; }

    transaction.getTransaction()
    .then
    (
        tx =>
        {
            // extract request ID from transaction input data (createOption called with requestID)
            let requestID = BigNumber.from("0x" + tx.data.slice(10)).toNumber();

            handler(requestID, id);
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
    for (let event of eventLabels) contracts.NFTOpt.on(event, handleEvent);
}
