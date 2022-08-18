// @ts-ignore
import classes from "./styles/DetailsView.module.scss";
import clsx from "clsx";

import { Collection_BASE } from "../../typechain-types";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { contracts } from "../../datasources/NFTOpt";
import { isExpired } from "../../datasources/options";
import { OptionState} from "../../models/enums";
import { OptionWithAsset } from "../../models/option";
import { ADDRESS0 } from "../../utils/constants";
import { connected, signer } from "../utils/metamask";
import { flavorLabels, eventLabels } from "../utils/labels";
import { dismissLastToast, showToast } from "../utils/toasting";
import { optionChangingIDs, requestChangingIDs, useAccount } from "../utils/contexts";
import Button_DetailsView from "../fragments/Button.DetailsView";
import Field_DetailsView from "../fragments/Field.DetailsView";
import FieldLink_DetailsView from "../fragments/FieldLink.DetailsView";
import toast from "react-hot-toast";
import { scanner } from "../../datasources/provider";

let getTransactionLink = async (option : OptionWithAsset) =>
{
    let filter = contracts.NFTOpt.filters[eventLabels[option.state]](option.id);

    let results = await contracts.NFTOpt.queryFilter(filter);

    return `${scanner}/tx/${results[0].transactionHash}`;
}

let checkAndSetApproved = (address : string, contract : any) =>
{
    if (address === contracts.NFTOpt.address) { setApproved(true); return; }

    contract.once
    (
        "Approval"
    ,   () =>
        {
            setApproved(true);

            dismissLastToast();
            toast.success("Approved to transfer NFT");
            console.log("approved transfer");
        }
    );
}

let withdrawOption = () => contracts.NFTOpt.withdrawRequest(_propsPtr.option.id);
let createOption   = () => contracts.NFTOpt.createOption(_propsPtr.option.id, { value: _propsPtr.option.strikePrice });
let cancelOption   = () => contracts.NFTOpt.cancelOption(_propsPtr.option.id);
let exerciseOption = () => contracts.NFTOpt.exerciseOption(_propsPtr.option.id);

let onAction = (promise : () => Promise<ethers.ContractTransaction>) => showToast
(
    promise().then
    (
        () =>
        {
            if (promise === withdrawOption) requestChangingIDs[_propsPtr.option.id] = 1;
            else                            optionChangingIDs[_propsPtr.option.id] = 1;

            if (_propsPtr.onAction) _propsPtr.onAction();
        }
    )
);

let handleWithdraw   = () => onAction(withdrawOption);
let handleCreate     = () => onAction(createOption);
let handleCancel     = () => onAction(cancelOption);
let handleExercise   = () => onAction(exerciseOption);
let handleApproveNFT = () => showToast( contract.connect(signer).approve(contracts.NFTOpt.address, _propsPtr.option.asset.key.nftId) );

let createButtonsFromOptionState = () =>
{
    if (requestChangingIDs[_propsPtr.option.id] || optionChangingIDs[_propsPtr.option.id]) return <></>;

    let isBuyer = (_propsPtr.option.buyer === account);

    if (_propsPtr.option.state === OptionState.PUBLISHED)
        return isBuyer
            ?   <Button_DetailsView
                    label="Withdraw Request"
                    variant="outlined"
                    className="btnSecondary"
                    onClick={handleWithdraw} />
            :   <Button_DetailsView
                    label="Create Option"
                    variant="contained"
                    className="btnPrimary"
                    onClick={handleCreate}/>;

    if (_propsPtr.option.state === OptionState.OPEN)
    {
        let btnCancel =
        (
            <Button_DetailsView
                label="Cancel Option"
                variant="outlined"
                className="btnSecondary"
                onClick={handleCancel} />
        );

        if (isExpired(_propsPtr.option)) return (isBuyer || _propsPtr.option.seller === account) && btnCancel;

        return isBuyer &&
        <>
            {btnCancel}
            <Button_DetailsView
                label={isApproved ? "Exercise Option" : "Approve NFT"}
                variant="contained"
                className="btnPrimary"
                onClick={ isApproved ? handleExercise : handleApproveNFT } />
        </>;
    }

    return <></>;
}

let isApproved = false;
let showTitle  = false;

let transactionLink : string;
let account  : string;
let contract : Collection_BASE;

let setApproved        : (a : boolean) => void;
let setTransactionLink : (a : string)  => void;

type Props =
{
    option     : OptionWithAsset
,   showTitle ?: true | boolean
,   onAction  ?: () => void
};

let _propsPtr : Props;

function DetailsView(props : Props)
{
    _propsPtr = props;

    [ isApproved      , setApproved ]        = useState(false);
    [ transactionLink , setTransactionLink ] = useState("");

    account = useAccount();

    showTitle = props.showTitle === undefined ? true : props.showTitle;

    useEffect
    (
        () =>
        {
            getTransactionLink(props.option).then(setTransactionLink);

            if (props.option.state !== OptionState.OPEN) return;

            contract = getCachedContract(props.option.asset.key.nftContract);

            contract.getApproved(props.option.asset.key.nftId).then( address => checkAndSetApproved(address, contract) );
        }
    ,   []
    );

    return <div
        className={classes.detailsWrapper}
        onClick={ (e) => e.stopPropagation() }
    >
        <div>
            <img src={props.option.asset.image} alt="NFT Image" />

            {
                showTitle &&
                <a
                    target="_blank"
                    href={transactionLink}
                    className={clsx(classes.link, classes.state)}
                >{eventLabels[props.option.state]}</a>
            }
        </div>

        <div className={classes.detailsSub}>

            { showTitle && <p className={classes.title}>{props.option.asset.name}</p> }

            <div>
                <div>
                    <FieldLink_DetailsView label="NFT contract" value={props.option.asset.key.nftContract} />
                    <Field_DetailsView     label="NFT token"    value={props.option.asset.key.nftId.toString()} />
                    <FieldLink_DetailsView label="Buyer"        value={props.option.buyer} />
                    {
                        props.option.seller !== ADDRESS0 &&
                        <FieldLink_DetailsView label="Seller"   value={props.option.seller} />
                    }
                </div>

                <div>
                    <Field_DetailsView label="Premium"      value={ethers.utils.formatEther(props.option.premium)} />
                    <Field_DetailsView label="Strike Price" value={ethers.utils.formatEther(props.option.strikePrice)} />
                    <Field_DetailsView label="Expiration"   value={`${props.option.interval} day${props.option.interval > 1 && "s"}`} />
                    <Field_DetailsView label="Style"        value={flavorLabels[props.option.flavor]} className="flavor"/>
                </div>
            </div>

            { connected && <div className={classes.buttonsContainer}>{ createButtonsFromOptionState() }</div> }
        </div>
    </div>;
}

export default DetailsView;
