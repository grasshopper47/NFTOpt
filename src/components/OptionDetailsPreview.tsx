import { ArrowBackIosRounded, ArrowRightAlt } from "@mui/icons-material";
import { Button, IconButton, Link } from "@mui/material";
import {addDays, endOfDay, isBefore, isSameDay} from "date-fns";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useContracts } from "../providers/contexts";
import { SECONDS_IN_A_DAY, TOAST_DURATION } from "../utils/constants";
import { getAccountDisplayValue, getCorrectPlural, throwTransactionToast } from "../utils/frontend";
import { OptionFlavor, OptionState, OptionWithNFTDetails } from "../utils/types";
import classes from "./styles/OptionDetailsPreview.module.scss";

type OptionDetailsPreviewProps = {
    currentAccount: string;
    option: OptionWithNFTDetails;
    onSelectOption: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const { currentAccount, option, onSelectOption } = props;

    const { nftOpt } = useContracts();

    const handleConfirmedTransaction = () => {
        throwTransactionToast("sent");
        onSelectOption(undefined);
    };

    const handleError = (error) => {
        if (error.code === 4001) {
            // Metamask TX Cancel
            toast.error("User canceled");
            return;
        }

        throwTransactionToast("failed");
        console.error(error);
    };

    const handleWithdrawOption = async () => {
        try {
            await nftOpt.withdrawOptionRequest(option.id);
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleCancelOption = async () => {
        try {
            await nftOpt.cancelOption(option.id);
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleCreateOption = async () => {
        const txOptions = {
            value: option.strikePrice.toString(),
        };

        try {
            await nftOpt.createOption(option.id, txOptions);
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleExerciseOption = async () => {
        try {
            await nftOpt.exerciseOption(option.id);
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const actionsForRequestState = (
        <>
            {option.buyer === currentAccount ? (
                <Button variant="outlined" className={classes.btnSecondary} onClick={handleWithdrawOption}>
                    Withdraw option
                </Button>
            ) : (
                <Button variant="contained" className={classes.btnPrimary} onClick={handleCreateOption}>
                    Sell option
                </Button>
            )}
        </>
    );

    const canExerciseOption = () => {
        if (option.buyer !== currentAccount || !option.startDate) {
            return false;
        }

        const startDate = new Date(parseInt(option.startDate) * 1000); // get date from epoch
        const endDate = addDays(startDate, option.interval);
        const today = endOfDay(new Date());

        // Can exercise only on the end day
        if (option.flavor === OptionFlavor.EUROPEAN) {
            return isSameDay(today, endDate);
        }

        // Can exercise any time before & including the end day
        if (option.flavor === OptionFlavor.AMERICAN) {
            return isSameDay(today, endDate) || isBefore(today, endDate);
        }

        return false;
    };

    const actionsForOpenState = (
        <>
            {option.buyer === currentAccount ? (
                canExerciseOption() ? (
                    <>
                        <Button variant="outlined" className={classes.btnSecondary} onClick={handleCancelOption}>
                            Cancel option
                        </Button>
                        <Button variant="contained" className={classes.btnPrimary} onClick={handleExerciseOption}>
                            Exercise option
                        </Button>
                    </>
                ) : (
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
                    <Link href={option.asset.url} target="_blank" className={classes.link}>
                        View on Opensea
                        <ArrowRightAlt />
                    </Link>
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
                                <span>{option.flavor === OptionFlavor.EUROPEAN ? "European" : "American"}</span>
                            </div>
                            <div className={classes.field}>
                                <span>Buyer:</span>
                                <span> {getAccountDisplayValue(option.buyer)}</span>
                            </div>
                            {option.seller ? (
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
