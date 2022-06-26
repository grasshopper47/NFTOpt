// @ts-ignore
import classes from "./styles/OptionDetailsView.module.scss";

import { scanner } from "../utils/metamask";
import { ArrowBackIosRounded } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { ethers } from "ethers";
import { account, signer } from "../utils/metamask";
import { dismissLastToast, showToast } from "../utils/toasting";
import {  OptionState, OptionWithAsset } from "../../models/option";
import { ADDRESS0 } from "../../utils/constants";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isExpired } from "../../datasources/options";
import { getCachedContract } from "../../datasources/NFT/localhost";
import { useContracts, useOptionChangingIDs } from "../../pages/_app";
import { flavorLabels } from "../utils/labels";
import { getAccountDisplayValue } from "../utils/helpers";
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

                setApproved(true);

                contract.removeAllListeners();

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

    function createButton
    (
        label     : string
    ,   variant   : "outlined" | "contained" | "text" | undefined
    ,   className : string
    ,   action    : any
    )
    {
        return <>
            <Button
                variant={variant}
                className={classes[className]}
                onClick={ action !== onApproveNFT ? () => onAction(action) : onApproveNFT}
            >
                {label}
            </Button>
        </>;
    }

    function createButtonsFromOptionState()
    {
        if (optionChangingIDs[option.id]) return;

        let isBuyer = (option.buyer === account());

        if (option.state === OptionState.PUBLISHED)
            if (isBuyer) return createButton("Withdraw Request", "outlined" , "btnSecondary", onWithdrawOption);
            else         return createButton("Create Option"   , "contained", "btnPrimary"  , onCreateOption);

        if (option.state === OptionState.OPEN)
        {
            let btnCancel = createButton("Cancel Option", "outlined", "btnSecondary", onCancelOption);

            if (isExpired(option))
                if (isBuyer || option.seller === account()) return <>{btnCancel}</>;

            if (isBuyer)
                return <>
                    {btnCancel}
                    {
                        isApproved
                        ?   createButton("Exercise Option", "contained", "btnPrimary", onExerciseOption)
                        :   createButton("Approve NFT"    , "contained", "btnPrimary", onApproveNFT)
                    }
                </>;

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

                <div>
                    <p className={classes.title}>{option.asset.name}</p>

                    <div>
                        <div>
                            <FieldLink_OptionDetailsView label="NFT contract" value={option.asset.nftContract} />
                            <Field_OptionDetailsView     label="NFT token"    value={option.asset.nftId.toString()} />
                            <Field_OptionDetailsView     label="Premium"      value={ethers.utils.formatEther(option.premium)} />
                            <Field_OptionDetailsView     label="Strike Price" value={ethers.utils.formatEther(option.strikePrice)} />
                        </div>

                        <div>
                            <Field_OptionDetailsView     label="Expiration"   value={ `${option.interval} day${option.interval > 1 && 's'}` } />
                            <Field_OptionDetailsView     label="Style"        value={flavorLabels[option.flavor]} className="flavor"/>
                            <FieldLink_OptionDetailsView label="Buyer"        value={option.buyer} />
                            {
                                option.seller !== ADDRESS0 &&
                                <FieldLink_OptionDetailsView label="Seller"   value={option.seller} />
                            }
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