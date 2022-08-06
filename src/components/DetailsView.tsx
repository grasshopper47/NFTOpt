// @ts-ignore
import classes from "./styles/DetailsView.module.scss";
import clsx from "clsx";

import React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRequests, useOptions, useAccount } from "../pages/_app";
import { isExpired } from "../../datasources/options";
import { OptionState} from "../../models/enums";
import { OptionWithAsset } from "../../models/option";
import { ADDRESS0 } from "../../utils/constants";
import { connected, scanner, signer } from "../utils/metamask";
import { flavorLabels, eventLabels } from "../utils/labels";
import { dismissLastToast, showToast } from "../utils/toasting";
import Button_DetailsView from "../fragments/Button.DetailsView";
import Field_DetailsView from "../fragments/Field.DetailsView";
import FieldLink_DetailsView from "../fragments/FieldLink.DetailsView";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { contracts } from "../../datasources/NFTOpt";

type Props =
{
    option     : OptionWithAsset
,   showTitle ?: true | boolean
,   onAction  ?: () => void
};

let _setApprovedCallback : (a : boolean) => void;

let checkAndSetApproved = (address : string, contract : any) =>
{
    if (address === contracts.NFTOpt.address) { _setApprovedCallback(true); return; }

    contract.once
    (
        "Approval"
    ,   () =>
        {
            _setApprovedCallback(true);

            dismissLastToast();
            toast.success("Approved to transfer NFT");
            console.log("approved transfer");
        }
    );
}

let onWithdrawOption = (option : OptionWithAsset) => contracts.NFTOpt.withdrawRequest(option.id);
let onCreateOption   = (option : OptionWithAsset) => contracts.NFTOpt.createOption(option.id, { value: option.strikePrice });
let onCancelOption   = (option : OptionWithAsset) => contracts.NFTOpt.cancelOption(option.id);
let onExerciseOption = (option : OptionWithAsset) => contracts.NFTOpt.exerciseOption(option.id);

function DetailsView(props: Props)
{
    const { option } = props;

    const showTitle = props.showTitle === undefined ? true : props.showTitle;

    const [ isApproved, setApproved ] = useState(false);

    _setApprovedCallback = setApproved;

    const account  = useAccount();
    const requests = useRequests();
    const options  = useOptions();

    let contract;

    useEffect
    (
        () =>
        {
            if (option.state !== OptionState.OPEN) return;

            contract = getCachedContract(option.asset.key.nftContract);

            contract.getApproved(option.asset.key.nftId).then( address => checkAndSetApproved(address, contract) );
        }
    ,   []
    );

    let onAction = promise => showToast
    (
        promise().then
        (
            () =>
            {
                if (promise === onWithdrawOption) requests.changing[option.id] = 1;
                else                              options.changing[option.id] = 1;

                if (props.onAction) props.onAction();
            }
        )
    );

    let onApproveNFT = () => showToast( contract.connect(signer()).approve(contracts.NFTOpt.address, option.asset.key.nftId) );

    function createButtonsFromOptionState()
    {
        if (requests.changing[option.id] || options.changing[option.id]) return <></>;

        let isBuyer = (option.buyer === account);

        if (option.state === OptionState.PUBLISHED)
            return isBuyer
                ?   <Button_DetailsView
                        label="Withdraw Request"
                        variant="outlined"
                        className="btnSecondary"
                        handleClick={ () => onAction(onWithdrawOption) } />
                :   <Button_DetailsView
                        label="Create Option"
                        variant="contained"
                        className="btnPrimary"
                        handleClick={ () => onAction(onCreateOption) }/>;

        if (option.state === OptionState.OPEN)
        {
            let btnCancel =
            (
                <Button_DetailsView
                    label="Cancel Option"
                    variant="outlined"
                    className="btnSecondary"
                    handleClick={ () => onAction(onCancelOption) } />
            );

            if (isExpired(option)) return (isBuyer || option.seller === account) && btnCancel;

            return isBuyer &&
            <>
                {btnCancel}
                <Button_DetailsView
                    label={isApproved ? "Exercise Option" : "Approve NFT"}
                    variant="contained"
                    className="btnPrimary"
                    handleClick={ isApproved ? () => onAction(onExerciseOption) : onApproveNFT } />
            </>;
        }

        return <></>;
    }

    return <div
        className={classes.detailsWrapper}
        onClick={ (e) => e.stopPropagation() }
    >
        <div>
            <img src={option.asset.image} alt="NFT Image" />

            {
                showTitle &&
                <a
                    target="_blank"
                    href={`${scanner()}/tx/${(option.state === OptionState.PUBLISHED ? requests : options).transactions[option.id]}`}
                    className={clsx(classes.link, classes.state)}
                >{eventLabels[option.state + 2]}</a>
            }
        </div>

        <div className={classes.detailsSub}>

            { showTitle && <p className={classes.title}>{option.asset.name}</p> }

            <div>
                <div>
                    <FieldLink_DetailsView label="NFT contract" value={option.asset.key.nftContract} />
                    <Field_DetailsView     label="NFT token"    value={option.asset.key.nftId.toString()} />
                    <FieldLink_DetailsView label="Buyer"        value={option.buyer} />
                    {
                        option.seller !== ADDRESS0 &&
                        <FieldLink_DetailsView label="Seller"   value={option.seller} />
                    }
                </div>

                <div>
                    <Field_DetailsView label="Premium"      value={ethers.utils.formatEther(option.premium)} />
                    <Field_DetailsView label="Strike Price" value={ethers.utils.formatEther(option.strikePrice)} />
                    <Field_DetailsView label="Expiration"   value={`${option.interval} day${option.interval > 1 ? 's' : ''}`} />
                    <Field_DetailsView label="Style"        value={flavorLabels[option.flavor]} className="flavor"/>
                </div>
            </div>

            { connected() && <div className={classes.buttonsContainer}>{ createButtonsFromOptionState() }</div> }
        </div>
    </div>;
}

export default DetailsView;
