// @ts-ignore
import classes from "./styles/OptionDetailsView.module.scss";

import { ArrowBackIosRounded } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { ethers } from "ethers";
import { useContracts } from "../providers/contexts";
import { getCurrentProvider, getSignedContract } from "../utils/metamask";
import { getAccountDisplayValue, getCorrectPlural, dismissLastToast, showToast } from "../utils/frontend";
import { OptionFlavor, OptionState, OptionWithAsset } from "../utils/types";
import { ADDRESS0, ABIs, SECONDS_IN_A_DAY } from "../utils/constants";
import { useEffect, useRef, useState } from "react";
import { ERC721 } from "../../typechain-types";
import toast from "react-hot-toast";

type OptionDetailsViewProps =
{
    currentAccount : string;
    option         : OptionWithAsset;
    onSelectOption : (OptionWithAsset: OptionWithAsset | null) => void;
};

function OptionDetailsView(props: OptionDetailsViewProps) {
    const { currentAccount, option, onSelectOption } = props;
    const { nftOpt } = useContracts();

    const isApproved = useRef<boolean>(false);
    const NFTContract = useRef<ERC721|null>(null);
    const [, doRender ] = useState(0);

    useEffect
    (
        () =>
        {
            // Create an instance of the NFT contract
            NFTContract.current =
            getSignedContract
            (
                option.asset.address,
                [
                    ABIs.ERC721.getApproved,
                    ABIs.ERC721.approve,
                    ABIs.ERC721.Events.Approval
                ]
            ) as ERC721;

            const afterGetApproved = (address) =>
            {
                if (!NFTContract.current) { return; }

                isApproved.current = (address === nftOpt.address);

                if (isApproved.current)
                {
                    NFTContract.current.removeAllListeners();

                    doRender(-1);

                    return;
                }

                // Listen to "Approval" event
                NFTContract.current.on
                (
                    "Approval",
                    () =>
                    {
                        if (isApproved.current) { return; }
                        isApproved.current = true;

                        dismissLastToast();
                        toast.success("Approved to transfer NFT");
                        console.log("approved NFT");

                        doRender(-2);
                    }
                );
            }

            isApproved.current = false;

            // Check that NFTOpt is approved to transfer tokenId
            NFTContract.current.getApproved(option.asset.tokenId)
                               .then(afterGetApproved);
        },
        []
    );

    const showListView = () => { onSelectOption(null); };

    const handleWithdrawOption = () => showToast( nftOpt.withdrawOptionRequest(option.id).then(showListView) );
    const handleCreateOption   = () => showToast( nftOpt.createOption(option.id, { value: option.strikePrice }).then(showListView) );
    const handleCancelOption   = () => showToast( nftOpt.cancelOption(option.id).then(showListView) );

    const handleExerciseOption = () =>
    {
        const promise = { current : null };

        // Approve contract to transfer NFT (step 1)
        if (!isApproved.current && NFTContract.current)
        {
            promise.current = NFTContract.current.connect(getCurrentProvider().getSigner())
                                                 .approve(nftOpt.address, option.asset.tokenId);
        }
        else
        {
            // Exercise the option when NFT is already approved (step 2)
            promise.current = nftOpt.exerciseOption(option.id)
                                    .then(showListView);
        }

        showToast(promise.current);
    };

    const isExerciseWindowClosed = () =>
    {
        if (option.buyer !== currentAccount || !option.startDate) { return false; }

        const timeNow = new Date().getTime() / 1000;
        const timeOption = parseInt(option.startDate.toString()) + (option.interval * SECONDS_IN_A_DAY);
        const diff = timeOption - timeNow;

        // Can exercise only on the end day (both EUROPEAN and AMERICAN)
        if (diff > -1 && diff <= SECONDS_IN_A_DAY ) { return true; }

        // Can exercise any time before & including the end day (AMERICAN)
        if (option.flavor === OptionFlavor.AMERICAN) { return diff > 0; }

        return false;
    };

    const actionsForRequestState =
    (
        <>
            {
                option.buyer === currentAccount ?
                    (
                        <Button variant="outlined" className={classes.btnSecondary} onClick={handleWithdrawOption}>
                            Withdraw Request
                        </Button>
                    )
                :
                    (
                        <Button variant="contained" className={classes.btnPrimary} onClick={handleCreateOption}>
                            Create Option
                        </Button>
                    )
            }
        </>
    );

    const actionsForOpenState =
    (
        <>
            {
                option.buyer === currentAccount ?
                (
                    isExerciseWindowClosed() ?
                        (
                            <>
                                {
                                    isApproved.current ?
                                    null
                                    :
                                    (
                                        <Button variant="outlined" className={classes.btnSecondary} onClick={handleCancelOption}>
                                            Cancel option
                                        </Button>
                                    )
                                }

                                <Button variant="contained" className={classes.btnPrimary} onClick={handleExerciseOption}>
                                    {isApproved.current ? "Exercise Option" : "Approve NFT"}
                                </Button>
                            </>
                        )
                    :
                        (
                            isApproved.current ?
                                null
                            :
                                (
                                    <Button variant="outlined" className={classes.btnSecondary} onClick={handleCancelOption}>
                                        Cancel option
                                    </Button>
                                )
                        )
                )
                : null
            }
        </>
    );

    return (
        <div className={classes.root}>
            <IconButton onClick={onSelectOption.bind(null, null)} className={classes.goBackBtn}>
                <ArrowBackIosRounded />
            </IconButton>
            <div className={classes.detailsContainer}>
                <div>
                    <img style={{ backgroundImage: `url(${option.asset.image})` }} alt="" />
                </div>
                <div>
                    <p className={classes.title}>{option.asset.name}</p>

                    <div>
                        <div>
                            <div className={classes.field}>
                                <span>NFT contract:</span>
                                <span>{getAccountDisplayValue(option.asset.address)}</span>
                            </div>
                            <div className={classes.field}>
                                <span>NFT token ID:</span>
                                <span> {option.asset.tokenId.toString()}</span>
                            </div>
                            <div className={classes.field}>
                                <span>Premium:</span>
                                <span> {ethers.utils.formatEther(option.premium)}</span>
                            </div>
                            <div className={classes.field}>
                                <span>Strike price:</span>
                                <span>{ethers.utils.formatEther(option.strikePrice)}</span>
                            </div>
                        </div>
                        <div>
                            <div className={classes.field}>
                                <span>Expiration date:</span>
                                <span>
                                    {option.interval} {getCorrectPlural("day", option.interval)}
                                </span>
                            </div>
                            <div className={classes.field}>
                                <span>Option style: </span>
                                <span className={classes.flavor}>
                                    {option.flavor === OptionFlavor.EUROPEAN ? "European" : "American"}
                                </span>
                            </div>
                            <div className={classes.field}>
                                <span>Buyer:</span>
                                <span> {getAccountDisplayValue(option.buyer)}</span>
                            </div>
                            {option.seller && option.seller !== ADDRESS0 ? (
                                <div className={classes.field}>
                                    <span>Seller:</span>
                                    <span> {getAccountDisplayValue(option.seller)}</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className={classes.buttonsContainer}>
                        {
                            option.state === OptionState.CANCELED ?
                                null
                            :
                                option.state === OptionState.PUBLISHED ?
                                    actionsForRequestState
                                :
                                    option.state === OptionState.OPEN ? actionsForOpenState : null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OptionDetailsView;