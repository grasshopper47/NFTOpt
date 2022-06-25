
import NFTOptSolContract from "../../artifacts/contracts/NFTOpt.sol/NFTOpt.json";
import addresses from "../../addresses.json";
import { NFTOpt } from "../../typechain-types";
import { getSignedContract, network } from "./metamask";
import { OptionState } from "./types";
import { actionLabels, dismissLastToast, TOAST_DURATION } from "./frontend";
import toast from "react-hot-toast";
import { loadOptionWithAsset, options } from "./options";

export const contracts   = { NFTOpt : null as unknown as NFTOpt };
export const blockNumber = { current : ~0 };

let _updateOptionsHash : () => void;

function onContractEvent
(
    action     : OptionState
,   optionID   : number
,   newBlockNo : number
)
{
    // Filter out old events which are re-emitted when intitialized, then emitted new event
    if (blockNumber.current >= newBlockNo) return;

    blockNumber.current = newBlockNo;

    dismissLastToast();

    toast.success("Successfully " + actionLabels[action], { duration: TOAST_DURATION });

    console.log(actionLabels[action]);

    if (action === OptionState.PUBLISHED) { loadOptionWithAsset(optionID).then(_updateOptionsHash); return; }

    for (let o of options)
    {
        if (o.id !== optionID) continue;

        o.state = action;

        break;
    }

    _updateOptionsHash();
}

export const createContractInstance = (updateOptionsHash : () => void) =>
{
    contracts.NFTOpt?.removeAllListeners();

    contracts.NFTOpt =
    getSignedContract
    (
        addresses[network()].NFTOpt
    ,   NFTOptSolContract.abi
    ) as NFTOpt;

    _updateOptionsHash = updateOptionsHash;

    contracts.NFTOpt.on("Published", (id, tx) => onContractEvent(OptionState.PUBLISHED, id.toNumber(), tx.blockNumber));
    contracts.NFTOpt.on("Withdrawn", (id, tx) => onContractEvent(OptionState.WITHDRAWN, id.toNumber(), tx.blockNumber));
    contracts.NFTOpt.on("Opened"   , (id, tx) => onContractEvent(OptionState.OPEN, id.toNumber(), tx.blockNumber));
    contracts.NFTOpt.on("Canceled" , (id, tx) => onContractEvent(OptionState.CANCELED, id.toNumber(), tx.blockNumber));
    contracts.NFTOpt.on("Exercised", (id, tx) => onContractEvent(OptionState.EXERCISED, id.toNumber(), tx.blockNumber));
}