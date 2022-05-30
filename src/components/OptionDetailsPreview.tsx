import { ArrowBackIosRounded } from "@mui/icons-material";
import { Button, IconButton } from "@mui/material";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { useContracts } from "../providers/contexts";
import { getCurrentProvider, getSignedContract, getTXOptions } from "../utils/metamask";
import { getAccountDisplayValue, getCorrectPlural, showToast } from "../utils/frontend";
import { OptionFlavor, OptionState, OptionWithAsset } from "../utils/types";
import classes from "./styles/OptionDetailsPreview.module.scss";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../utils/constants";
import { useState } from "react";

type OptionDetailsPreviewProps = {
    currentAccount: string;
    option: OptionWithAsset;
    onSelectOption: (OptionWithAsset: OptionWithAsset | null) => void;
    lastSelectedOptionId: React.MutableRefObject<number | null>;
};

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const { currentAccount, option, onSelectOption, lastSelectedOptionId } = props;

    const { nftOpt } = useContracts();

    const [approvedNFT, setApprovedNFT] = useState(true);

    let canceledOption = false;

    let abi_IERC721: any = [];

    const handleCheckApproved = async () => {
        if (option.state === OptionState.OPEN) {
            abi_IERC721 = [
                {
                    inputs: [
                        {
                            internalType: "address",
                            name: "to",
                            type: "address",
                        },
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "approve",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [
                        {
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "getApproved",
                    outputs: [
                        {
                            internalType: "address",
                            name: "",
                            type: "address",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    anonymous: false,
                    inputs: [
                        {
                            indexed: true,
                            internalType: "address",
                            name: "owner",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "address",
                            name: "approved",
                            type: "address",
                        },
                        {
                            indexed: true,
                            internalType: "uint256",
                            name: "tokenId",
                            type: "uint256",
                        },
                    ],
                    name: "Approval",
                    type: "event",
                },
            ];

            let NFTContract = getSignedContract(option.asset.address, abi_IERC721);

            await NFTContract.getApproved(option.asset.tokenId).then((res) => {
                if (res != nftOpt.address) {
                    setApprovedNFT(false);
                }
            });
        }
    };

    handleCheckApproved();

    const handleConfirmedTransaction = () => {
        showToast("sent");

        if (approvedNFT || canceledOption) {
            lastSelectedOptionId.current = option.id;

            // Reset panel to list view
            onSelectOption(undefined);
        }
    };

    const handleError = (error) => {
        if (error.code === 4001) {
            // Metamask TX Cancel
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
            canceledOption = true;
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleExerciseOption = async () => {
        try {
            if (!approvedNFT) {
                let NFTContract = getSignedContract(option.asset.address, abi_IERC721);

                NFTContract.on("Approval", () => {
                    if (!approvedNFT) {
                        setApprovedNFT(true);
                    }
                });

                await NFTContract.connect(getCurrentProvider().getSigner()).approve(
                    nftOpt.address,
                    option.asset.tokenId,
                    await getTXOptions()
                );
            } else {
                await nftOpt.exerciseOption(option.id, await getTXOptions());
            }

            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const handleCreateOption = async () => {
        try {
            await nftOpt.createOption(option.id, { value: option.strikePrice });
            handleConfirmedTransaction();
        } catch (error) {
            handleError(error);
        }
    };

    const actionsForRequestState = (
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

    const canExerciseOption = () => {
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

    const actionsForOpenState = (
        <>
            {option.buyer === currentAccount ? (
                canExerciseOption() ? (
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