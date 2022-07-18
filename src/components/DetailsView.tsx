// @ts-ignore
import classes from "./styles/DetailsView.module.scss";
import clsx from "clsx";

import React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useContracts, useRequests, useOptions, useAccount } from "../pages/_app";
import { OptionState} from "../../models/option";
import { isExpired } from "../../datasources/options";
import { getCachedContract } from "../../datasources/NFTAssets";
import { OptionWithAsset } from "../../models/extended";
import { ADDRESS0 } from "../../utils/constants";
import { connected, scanner, signer } from "../utils/metamask";
import { flavorLabels, eventLabels } from "../utils/labels";
import { dismissLastToast, showToast } from "../utils/toasting";
import Button_DetailsView from "../fragments/Button.DetailsView";
import Field_DetailsView from "../fragments/Field.DetailsView";
import FieldLink_DetailsView from "../fragments/FieldLink.DetailsView";

type Props =
{
    option    : OptionWithAsset
,   onAction ?: () => void
};

function DetailsView(props: Props)
{
    const { option } = props;

    const showTitle = props.onAction !== null && props.onAction !== undefined;

    const [ isApproved, setApproved ] = useState(false);

    const account   = useAccount();
    const contracts = useContracts();
    const requests  = useRequests();
    const options   = useOptions();

    let contract;

    useEffect
    (
        () =>
        {
            if (option.state !== OptionState.OPEN) return;

            contract = getCachedContract(option.asset.key.nftContract);

            contract.getApproved(option.asset.key.nftId).then(checkAndSetApproved);
        }
    ,   []
    );

    let checkAndSetApproved = (address : string) =>
    {
        if (address === contracts.NFTOpt.address) { setApproved(true); return; }

        contract.once
        (
            "Approval"
        ,   () =>
            {
                if (isApproved) return;
                setApproved(true);

                dismissLastToast();
                toast.success("Approved to transfer NFT");
                console.log("approved transfer");
            }
        );
    }

    let onWithdrawOption = () => contracts.NFTOpt.withdrawRequest(option.id);
    let onCreateOption   = () => contracts.NFTOpt.createOption(option.id, { value: option.strikePrice });
    let onCancelOption   = () => contracts.NFTOpt.cancelOption(option.id);
    let onExerciseOption = () => contracts.NFTOpt.exerciseOption(option.id);

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

    let onApproveNFT = () => showToast(contract.connect(signer()).approve(contracts.NFTOpt.address, option.asset.key.nftId));

    const getStateTransactionScannerLink = () =>
    {
        let hash = option.state === -1
        ?   requests.transactions[option.id]
        :   options.transactions[option.id];

        return `${scanner()}/tx/${hash}`;
    }

    function createButtonsFromOptionState()
    {
        if (requests.changing[option.id] || options.changing[option.id]) return;

        let isBuyer = (option.buyer === account);

        if (option.state === -1)
            if (isBuyer)
                return <Button_DetailsView
                    label="Withdraw Request"
                    variant="outlined"
                    className="btnSecondary"
                    handleClick={ () => onAction(onWithdrawOption) }
                />;
            else
                return <Button_DetailsView
                    label="Create Option"
                    variant="contained"
                    className="btnPrimary"
                    handleClick={ () => onAction(onCreateOption) }
                />;

        if (option.state === OptionState.OPEN)
        {
            let btnCancel =
            (
                <Button_DetailsView
                    label="Cancel Option"
                    variant="outlined"
                    className="btnSecondary"
                    handleClick={ () => onAction(onCancelOption) }
                />
            );

            if (isExpired(option))
            {
                if (isBuyer || option.seller === account) return btnCancel;

                return <></>;
            }

            if (isBuyer)
            {
                return <>
                    {btnCancel}
                    <Button_DetailsView
                        label={isApproved ? "Exercise Option" : "Approve NFT"}
                        variant="contained"
                        className="btnPrimary"
                        handleClick={ isApproved ? () => onAction(onExerciseOption) : onApproveNFT }
                    />
                </>;
            }

            return <></>;
        }
    }

    return <div
        className={classes.detailsWrapper}
        onClick={ (e) => e.stopPropagation() }
    >
        <div>
            <img src={option.asset.image} alt="NFT Image" />

            {
                showTitle &&
                <a  target="_blank"
                    href={getStateTransactionScannerLink()}
                    className={clsx(classes.link, classes.state)}
                >
                    {eventLabels[option.state + 2]}
                </a>
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
                    <Field_DetailsView     label="Premium"      value={ethers.utils.formatEther(option.premium)} />
                    <Field_DetailsView     label="Strike Price" value={ethers.utils.formatEther(option.strikePrice)} />
                    <Field_DetailsView     label="Expiration"   value={`${option.interval} day${option.interval > 1 ? 's' : ''}`} />
                    <Field_DetailsView     label="Style"        value={flavorLabels[option.flavor]} className="flavor"/>
                </div>
            </div>

            { connected() && <div className={classes.buttonsContainer}>{ createButtonsFromOptionState() }</div> }
        </div>
    </div>;
}

export default DetailsView;
