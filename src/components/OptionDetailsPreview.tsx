import {ArrowBackIosRounded, ArrowRightAlt} from "@mui/icons-material";
import {Button, IconButton, Link, Typography} from "@mui/material";
import {endOfDay, isBefore, isSameDay} from "date-fns";
import {getAccountDisplayValue} from "../utils/api";
import {OptionFlavor, OptionState, OptionWithNFTDetails} from "../utils/declarations";
import classes from "./styles/OptionDetailsPreview.module.scss";

type OptionDetailsPreviewProps = {
    currentAccount: string;
    option: OptionWithNFTDetails;
    onSelectOption: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const {currentAccount, option, onSelectOption} = props;

    const handleWithdrawOption = () => {};

    const handleCancelOption = () => {};

    const handleCreateOption = () => {};

    const handleExerciseOption = () => {};

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
        if (option.flavor === OptionFlavor.EUROPEAN) {
            return isSameDay(option.interval, today);
        }
        if (option.flavor === OptionFlavor.AMERICAN) {
            return isBefore(today, option.interval) || isSameDay(option.interval, today);
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
                                <span>{new Date(option.interval).toLocaleDateString()}</span>
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
