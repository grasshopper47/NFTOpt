import {ArrowBackIosRounded, ArrowRightAlt} from "@mui/icons-material";
import {Button, IconButton, Link, Typography} from "@mui/material";
import {endOfDay, isBefore, isSameDay} from "date-fns";
import {ethers} from "ethers";
import toast from "react-hot-toast";
import {useContracts} from "../providers/contexts";
import {getAccountDisplayValue} from "../utils/api";
import {OptionFlavor, OptionState, OptionWithNFTDetails} from "../utils/declarations";
import classes from "./styles/OptionDetailsPreview.module.scss";

type OptionDetailsPreviewProps = {
    currentAccount: string;
    option: OptionWithNFTDetails;
    onSelectOption: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

type TriggerActionErrorType = "withdraw" | "cancel" | "exercise" | "create";
type TriggerActionSuccessType = "withdrawn" | "canceled" | "exercised" | "created";

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const {currentAccount, option, onSelectOption} = props;

    const {nftOpt} = useContracts();

    const handleSuccess = (trigger: TriggerActionSuccessType) => {
        toast.success(`The option was successfully ${trigger}`, {duration: 4000});
        onSelectOption(undefined);
    };

    const handleError = (error, trigger: TriggerActionErrorType) => {
        console.error(error);
        toast.error(`There was an error while trying to ${trigger} the option`, {duration: 4000});
    };

    const handleWithdrawOption = async () => {
        try {
            await nftOpt.withdrawOptionRequest(option.id);
            handleSuccess("withdrawn");
        } catch (error) {
            handleError(error, "withdraw");
        }
    };

    const handleCancelOption = async () => {
        try {
            await nftOpt.cancelOption(option.id);
            handleSuccess("canceled");
        } catch (error) {
            handleError(error, "cancel");
        }
    };

    const handleCreateOption = async () => {
        const txOptions = {
            value: ethers.utils.parseEther(`${option.strikePrice}`),
            gasLimit: 100000,
        };

        try {
            await nftOpt.createOption(option.id, txOptions);
            handleSuccess("created");
        } catch (error) {
            handleError(error, "create");
        }
    };

    const handleExerciseOption = async () => {
        try {
            await nftOpt.exerciseOption(option.id);
            handleSuccess("exercised");
        } catch (error) {
            handleError(error, "exercise");
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
        if (option.buyer !== currentAccount) {
            return false;
        }
        const today = endOfDay(new Date());
        let end_day = new Date(option.startDate);

        end_day.setDate(end_day.getDate() + option.interval / (24 * 3600));

        if (option.flavor === OptionFlavor.EUROPEAN) {
            return isSameDay(end_day, today);
        }
        if (option.flavor === OptionFlavor.AMERICAN) {
            return isBefore(today, end_day) || isSameDay(end_day, today);
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
                    <img style={{backgroundImage: `url(${option.asset.image})`}} alt="" />
                    <Link href={option.asset.url} target="_blank" className={classes.link}>
                        View on Opensea
                        <ArrowRightAlt />
                    </Link>
                </div>
                <div>
                    <Typography className={classes.title}>{option.asset.name}</Typography>

                    <div>
                        <div>
                            <div className={classes.field}>
                                <span>NFT contract:</span>
                                <span>{getAccountDisplayValue(option.asset.address)}</span>
                            </div>
                            <div className={classes.field}>
                                <span>NFT token ID:</span>
                                <span> {option.asset.tokenId}</span>
                            </div>
                            <div className={classes.field}>
                                <span>Premium:</span>
                                <span> {option.premium}</span>
                            </div>
                            <div className={classes.field}>
                                <span>Strike price:</span>
                                <span>{option.strikePrice}</span>
                            </div>
                        </div>
                        <div>
                            <div className={classes.field}>
                                <span>Expiration date:</span>
                                <span>{option.interval} days</span>
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
