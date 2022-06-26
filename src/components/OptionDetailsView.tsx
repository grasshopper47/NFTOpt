// @ts-ignore
import classes from "../styles/components/OptionDetailsView.module.scss";

import { ArrowBackIosRounded } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { ethers } from "ethers";
import { account, signer } from "../utils/frontend/metamask";
import { dismissLastToast, showToast } from "../utils/frontend/toasting";
import {  OptionState, OptionWithAsset } from "../models/option";
import { ADDRESS0 } from "../utils/constants";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { isExpired } from "../datasources/options";
import { getCachedContract } from "../datasources/NFT/localhost";
import { useContracts, useOptionChangingIDs } from "../pages/_app";
import { flavorLabels } from "../utils/frontend/labels";
import { getAccountDisplayValue } from "../utils/frontend/helpers";

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
                            <div className={classes.field}>
                                <span>NFT contract</span>
                                <span>{getAccountDisplayValue(option.asset.nftContract)}</span>
                            </div>

                            <div className={classes.field}>
                                <span>NFT token</span>
                                <span>{option.asset.nftId.toString()}</span>
                            </div>

                            <div className={classes.field}>
                                <span>Premium</span>
                                <span>{ethers.utils.formatEther(option.premium)}</span>
                            </div>

                            <div className={classes.field}>
                                <span>Strike Price</span>
                                <span>{ethers.utils.formatEther(option.strikePrice)}</span>
                            </div>
                        </div>

                        <div>
                            <div className={classes.field}>
                                <span>Expiration</span>
                                <span>{option.interval} day{option.interval > 1 && "s"}</span>
                            </div>

                            <div className={classes.field}>
                                <span>Style</span>
                                <span className={classes.flavor}>{flavorLabels[option.flavor]}</span>
                            </div>

                            <div className={classes.field}>
                                <span>Buyer</span>
                                <span>{getAccountDisplayValue(option.buyer)}</span>
                            </div>
                            {
                                option.seller !== ADDRESS0
                                &&  <div className={classes.field}>
                                        <span>Seller</span>
                                        <span>{getAccountDisplayValue(option.seller)}</span>
                                    </div>
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