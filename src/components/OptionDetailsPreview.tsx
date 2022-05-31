import { ArrowBackIosRounded } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { ethers } from "ethers";
import { useContracts } from "../providers/contexts";
import { getCurrentProvider, getSignedContract } from "../utils/metamask";
import { getAccountDisplayValue, getCorrectPlural, dismissLastToast, showToast } from "../utils/frontend";
import { OptionFlavor, OptionState, OptionWithAsset } from "../utils/types";
import classes from "./styles/OptionDetailsPreview.module.scss";
import { ADDRESS0, ABIs, SECONDS_IN_A_DAY } from "../utils/constants";
import { useState } from "react";
import { ERC721 } from "../../typechain-types";

type OptionDetailsPreviewProps = {
    currentAccount: string;
    option: OptionWithAsset;
    onSelectOption: (OptionWithAsset: OptionWithAsset | null) => void;
    lastSelectedOptionId: React.MutableRefObject<number | null>;
};

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const { currentAccount, option, onSelectOption, lastSelectedOptionId } = props;
    const { nftOpt } = useContracts();
    const [approvedNFT, setApprovedNFT] = useState(false);

    let canceledOption = false;

    // Create an instance of the NFT contract
    const NFTContract : ERC721 =
    getSignedContract
    (
        option.asset.address,
        [
            ABIs.ERC721.getApproved,
            ABIs.ERC721.approve,
            ABIs.ERC721.Events.Approval
        ]
    ) as ERC721;

    // Check that NFTOpt is approved to transfer tokenId
    NFTContract.getApproved(option.asset.tokenId)
    .then(res => { if (res === nftOpt.address) { setApprovedNFT(true); } });

    // Listen to "Approval" event
    NFTContract.on
    (
        "Approval",
        () =>
        {
            if (approvedNFT) { return; }

            dismissLastToast();
            setApprovedNFT(true);
        }
    );

    const handleConfirmedTransaction = () =>
    {
        dismissLastToast();

        if (approvedNFT || canceledOption)
        {
            lastSelectedOptionId.current = option.id;

            // Reset panel to list view
            onSelectOption(undefined);
        }
    };

    const handleWithdrawOption = () => showToast( nftOpt.withdrawOptionRequest(option.id).then(handleConfirmedTransaction) );
    const handleCreateOption   = () => showToast( nftOpt.createOption(option.id, { value: option.strikePrice }).then(handleConfirmedTransaction) );
    const handleCancelOption   = () => showToast( nftOpt.cancelOption(option.id).then(handleConfirmedTransaction) );

    const handleExerciseOption = () =>
    {
        const promise = { current : null };

        // Exercise the option (step 2)
        if (approvedNFT)
        {
            promise.current = nftOpt.exerciseOption(option.id);
        }
        // Approve NFT (step 1)
        else
        {
            promise.current = NFTContract.connect(getCurrentProvider().getSigner())
                                         .approve(nftOpt.address, option.asset.tokenId);
        }

        promise.current.then(handleConfirmedTransaction);
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
            {option.buyer === currentAccount ? (
                <Button variant="outlined" className={classes.btnSecondary} onClick={handleWithdrawOption}>
                    Withdraw Request
                </Button>
            ) : (
                <Button variant="contained" className={classes.btnPrimary} onClick={handleCreateOption}>
                    Create Option
                </Button>
            )}
        </>
    );

    const actionsForOpenState =
    (
        <>
            {option.buyer === currentAccount ? (
                isExerciseWindowClosed() ? (
                    <>
                        {approvedNFT ? null : (
                            <Button variant="outlined" className={classes.btnSecondary} onClick={handleCancelOption}>
                                Cancel option
                            </Button>
                        )}
                        <Button variant="contained" className={classes.btnPrimary} onClick={handleExerciseOption}>
                            {approvedNFT ? "Exercise Option" : "Approve NFT"}
                        </Button>
                    </>
                ) : approvedNFT ? null : (
                    <Button variant="outlined" className={classes.btnSecondary} onClick={handleCancelOption}>
                        Cancel option
                    </Button>
                )
            ) : null}
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
                        {option.state === OptionState.CLOSED
                            ? null
                            : option.state === OptionState.REQUEST
                                ? actionsForRequestState
                                : option.state === OptionState.OPEN
                                    ? actionsForOpenState
                                    : null}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OptionDetailsPreview;