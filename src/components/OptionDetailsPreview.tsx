import {ArrowBackIosRounded, ArrowRightAlt} from "@mui/icons-material";
import {Button, IconButton, Link} from "@mui/material";
import { endOfDay, isBefore, isSameDay } from "date-fns";
import {ethers} from "ethers";
import toast from "react-hot-toast";
import {useContracts} from "../providers/contexts";
import { getAccountDisplayValue, getCorrectPlural, showToast } from "../utils/frontend";
import {OptionFlavor, OptionState, OptionWithNFTDetails} from "../utils/types";
import classes from "./styles/OptionDetailsPreview.module.scss";

type OptionDetailsPreviewProps = {
    currentAccount: string;
    option: OptionWithNFTDetails;
    onSelectOption: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const {currentAccount, option, onSelectOption} = props;

    const {nftOpt} = useContracts();

    const handleConfirmedTransaction = () => {
        showToast("sent");
        onSelectOption(undefined);
    };

    const handleError = (error) => {
        if (error.code === 4001) { // Metamask TX Cancel
            toast.error("User canceled");
            return;
        }

        showToast("failed");
        console.error(error);
    };

    const handleWithdrawOption = async () => {
        try {
            await nftOpt.withdrawOptionRequest(option.id, await getTXOptions());
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleCancelOption = async () => {
        try {
            await nftOpt.cancelOption(option.id, await getTXOptions());
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleExerciseOption = async () => {
        try {
            await nftOpt.exerciseOption(option.id, await getTXOptions());
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleCreateOption = async () => {
        const txOptions = {
            value: option.strikePrice.toString(),
            nonce: getCurrentProvider().getTransactionCount(getCurrentAccount()) + 1
        };

        try {
            await nftOpt.createOption(option.id, txOptions);

            const abi_IERC721: any = [
                {
                    "inputs": [
                        {
                            "internalType": "address",
                            "name": "to",
                            "type": "address"
                        },
                        {
                            "internalType": "uint256",
                            "name": "tokenId",
                            "type": "uint256"
                        }
                    ],
                    "name": "approve",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                },
            ];

            let NFTContract = getSignedContract(option.asset.address, abi_IERC721);

            // TX 1: ask for approval to send NFT
            NFTContract.connect(getCurrentProvider().getSigner()).approve(nftOpt.address, option.asset.tokenId);

            // TX 2: exercise

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

        const today = endOfDay(new Date());
        let end_day = new Date((option.startDate + option.interval) * 1000);

        // Can exercise only on the end day (both EUROPEAN and AMERICAN)
        if (isSameDay(end_day, today)) { return true; }

        // Can exercise any time before & including the end day
        if (option.flavor === OptionFlavor.AMERICAN) { return isBefore(today, end_day); }

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
                            {option.seller && option.seller !== addressEmpty ? (
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
