// @ts-ignore
import classes from "./styles/OptionDetailsView.module.scss";

import { ArrowBackIosRounded } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isExpired } from "../../datasources/options";
import { getCachedContract } from "../../datasources/NFT/localhost";
import { useContracts, useOptionChangingIDs } from "../../pages/_app";
import {  OptionState, OptionWithAsset } from "../../models/option";
import { ADDRESS0 } from "../../utils/constants";
import { account, signer } from "../utils/metamask";
import { flavorLabels } from "../utils/labels";
import { dismissLastToast, showToast } from "../utils/toasting";
import Button_OptionDetailsView from "../fragments/Button.OptionDetailsView";
import Field_OptionDetailsView from "../fragments/Field.OptionDetailsView";
import FieldLink_OptionDetailsView from "../fragments/FieldLink.OptionDetailsView";

type OptionDetailsViewProps =
{
    option       : OptionWithAsset;
    showListView : () => void;
};

function OptionDetailsView(props: OptionDetailsViewProps)
{
    const { option, showListView } = props;

    const [ isApproved, setApproved ] = useState(false);

    const contracts         = useContracts();
    const optionChangingIDs = useOptionChangingIDs();

    let contract;

    useEffect
    (
        () =>
        {
            if (option.state !== OptionState.OPEN) return;

            contract = getCachedContract(option.asset.nftContract);

            contract.getApproved(option.asset.nftId).then(checkAndSetApproved);
        }
    ,   []
    );

    let checkAndSetApproved = (address : string) =>
    {
        if (address === contracts.NFTOpt.address) { setApproved(true); return; }

        contract.on
        (
            "Approval"
        ,   () =>
            {
                if (isApproved) return;

                contract.removeAllListeners();

                setApproved(true);

                dismissLastToast();
                toast.success("Approved to transfer NFT");
                console.log("approved transfer");
            }
        );
    }

    let onWithdrawOption = () => contracts.NFTOpt.withdrawOptionRequest(option.id);
    let onCreateOption   = () => contracts.NFTOpt.createOption(option.id, { value: option.strikePrice });
    let onCancelOption   = () => contracts.NFTOpt.cancelOption(option.id);
    let onExerciseOption = () => contracts.NFTOpt.exerciseOption(option.id);

    let onAction         = (promise) => showToast(promise().then(() => { optionChangingIDs[option.id] = 1; showListView(); }));

    let onApproveNFT     = () => showToast(contract.connect(signer()).approve(contracts.NFTOpt.address, option.asset.nftId));

    function createButtonsFromOptionState()
    {
        if (optionChangingIDs[option.id]) return;

        let isBuyer = (option.buyer === account());

        if (option.state === OptionState.PUBLISHED)
            if (isBuyer) return <Button_OptionDetailsView label="Withdraw Request" variant="outlined" className="btnSecondary" handleClick={() => onAction(onWithdrawOption)} />;
            else         return <Button_OptionDetailsView label="Create Option" variant="contained" className="btnPrimary" handleClick={() => onAction(onCreateOption)} />;

        if (option.state === OptionState.OPEN)
        {
            let btnCancel = ( <Button_OptionDetailsView label="Cancel Option" variant="outlined" className="btnSecondary" handleClick={() => onAction(onCancelOption)} /> );

            if (isExpired(option))
            {
                if (isBuyer || option.seller === account()) return <>{btnCancel}</>;
            }
            else if (isBuyer)
            {
                return <>
                    {btnCancel}
                    <Button_OptionDetailsView
                        label={isApproved ? "Exercise Option" : "Approve NFT"}
                        variant="contained"
                        className="btnPrimary"
                        handleClick={isApproved ? () => onAction(onExerciseOption) : onApproveNFT }
                    />
                </>;
            }

            return <></>;
        }
    }

    return <>
        <div className={classes.root}>
            <IconButton className={classes.goBackBtn} onClick={showListView}>
                <ArrowBackIosRounded />
            </IconButton>

            <div className={classes.detailsContainer}>
                <div>
                    <img src={option.asset.image} alt="NFT Image" />
                </div>

                <div className={classes.detailsSub}>
                    <p className={classes.title}>{option.asset.name}</p>

                    <div>
                        <div>
                            <FieldLink_OptionDetailsView label="NFT contract" value={option.asset.nftContract} />
                            <Field_OptionDetailsView     label="NFT token"    value={option.asset.nftId.toString()} />
                            <FieldLink_OptionDetailsView label="Buyer"        value={option.buyer} />
                            {
                                option.seller !== ADDRESS0 &&
                                <FieldLink_OptionDetailsView label="Seller"   value={option.seller} />
                            }
                        </div>

                        <div>
                            <Field_OptionDetailsView     label="Premium"      value={ethers.utils.formatEther(option.premium)} />
                            <Field_OptionDetailsView     label="Strike Price" value={ethers.utils.formatEther(option.strikePrice)} />
                            <Field_OptionDetailsView     label="Expiration"   value={ `${option.interval} day${option.interval > 1 ? 's' : ''}` } />
                            <Field_OptionDetailsView     label="Style"        value={flavorLabels[option.flavor]} className="flavor"/>
                        </div>
                    </div>

                    <div className={classes.buttonsContainer}>
                        {createButtonsFromOptionState()}
                    </div>
                </div>
            </div>
        </div>
    </>;
}

export default OptionDetailsView;