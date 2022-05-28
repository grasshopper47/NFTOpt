import {
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
} from "@mui/material";
import clsx from "clsx";
import React, {useEffect, useState} from "react";
import Layout from "../components/Layout";
import {useAccount, useContracts} from "../providers/contexts";
import {floatNumberRegex, SECONDS_IN_A_DAY, TOAST_DURATION} from "../utils/constants";
import {NFTAsset, OptionFlavor} from "../utils/types";
import classes from "./styles/CreateOption.module.scss";
import {ethers} from "ethers";
import {dummyNFT} from "../utils/dummyData";
import toast from "react-hot-toast";
import {fetchAssetsForAddress, throwTransactionToast} from "../utils/frontend";

type FormState = {
    asset?: NFTAsset;
    strikePrice?: string;
    premium?: string;
    interval?: number;
    flavor?: OptionFlavor;
};

function CreateOption() {
    const account = useAccount();
    const {nftOpt} = useContracts();

    // TODO Stefana: cleanup dummy data
    const [assets, setAssets] = useState<NFTAsset[]>([dummyNFT]);
    const [formState, setFormState] = useState<FormState>({
        asset: undefined,
        premium: "",
        strikePrice: "",
        interval: undefined,
        flavor: OptionFlavor.EUROPEAN,
    });

    useEffect(() => {
        if (!account) {
            return;
        }
        fetchAssetsForAddress(account, setAssets);
    }, [account]);

    const handleSelectAsset = (asset: NFTAsset) => {
        setFormState((prev) => ({
            ...prev,
            asset,
        }));
    };

    const handleChangeFieldString = (field: keyof FormState, event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.target.value == undefined ? "" : event.target.value;

        setFormState((prev) => ({
            ...prev,
            [field]:
                Number.isNaN(parseFloat(val)) || parseFloat(val) < 0 || !floatNumberRegex.test(val)
                    ? "0"
                    : event.target.value,
        }));
    };

    const handleChangeFlavor = (flavor: OptionFlavor) => {
        setFormState((prev) => ({
            ...prev,
            flavor,
        }));
    };

    const checkFormIsValid = () => {
        const missingFormFields =
            Object.values(formState).filter((x) => x != null).length !==
            Object.keys(formState).filter((x) => x != null).length;

        return (
            formState.asset != null &&
            !missingFormFields &&
            formState.premium != null &&
            formState.premium != "" &&
            parseFloat(formState.premium) !== 0 &&
            formState.strikePrice != null &&
            formState.strikePrice != "" &&
            parseFloat(formState.strikePrice) !== 0 &&
            formState.interval != 0
        );
    };

    const handleChangeInterval = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.value) {
            // @ts-ignore
            setFormState((prev) => ({
                ...prev,
                interval: "",
            }));

            return;
        }

        setFormState((prev) => ({
            ...prev,
            interval: Math.max(1, Math.min(parseInt(event.target.value), 30)),
        }));
    };

    const handlePublishOption = async () => {
        const txOptions = {
            value: ethers.utils.parseEther(`${parseFloat(formState.premium)}`),
        };

        try {
            await nftOpt.publishOptionRequest(
                formState.asset.address,
                formState.asset.tokenId,
                ethers.utils.parseEther(`${parseFloat(formState.strikePrice)}`),
                formState.interval * SECONDS_IN_A_DAY,
                formState.flavor,
                txOptions
            );
            throwTransactionToast("confirmed");
        } catch (error) {
            if (error.code === 4001) {
                // Metamask TX Cancel
                toast.error("User canceled");
                return;
            }

            throwTransactionToast("failed");
            console.error(error);
        }
    };

    return (
        <Layout>
            <div className={classes.root}>
                <div className={classes.form}>
                    <p className={classes.title}>Create PUT Option</p>
                    <div className={classes.fieldWrapper}>
                        <Select value={formState.asset?.tokenId.toString() ?? -1} placeholder="Select your NFT">
                            <MenuItem value={-1}>Select your NFT</MenuItem>
                            {assets.map((asset) => (
                                <MenuItem
                                    key={`asset-${asset.tokenId}`}
                                    value={asset.tokenId.toString()}
                                    onClick={handleSelectAsset.bind(null, asset)}
                                >
                                    {asset.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </div>

                    <div className={classes.fieldWrapper}>
                        <label>Premium</label>
                        <TextField
                            key={`input-premium`}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                            }}
                            placeholder="Enter the premium"
                            className={classes.field}
                            value={formState.premium}
                            onChange={handleChangeFieldString.bind(this, "premium")}
                        />
                    </div>

                    <div className={classes.fieldWrapper}>
                        <label>Strike price</label>
                        <TextField
                            key={`input-strike-price`}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                            }}
                            placeholder="Enter the strike price"
                            className={classes.field}
                            value={formState.strikePrice}
                            onChange={handleChangeFieldString.bind(this, "strikePrice")}
                        />
                    </div>

                    <div className={classes.fieldWrapper}>
                        <label>Interval</label>
                        <TextField
                            key={`input-interval`}
                            InputProps={{
                                inputProps: {
                                    min: 1,
                                    max: 30,
                                },
                                endAdornment: <InputAdornment position="end">days</InputAdornment>,
                            }}
                            type="number"
                            placeholder="Enter the expiration interval"
                            className={classes.field}
                            value={formState.interval ?? ""}
                            onChange={handleChangeInterval}
                        />
                    </div>

                    <FormControl className={classes.field}>
                        <label>Option Flavor</label>
                        <RadioGroup defaultValue={OptionFlavor.EUROPEAN}>
                            <FormControlLabel
                                key={`option-flavor-european`}
                                label="European"
                                value={OptionFlavor.EUROPEAN}
                                onChange={handleChangeFlavor.bind(null, OptionFlavor.EUROPEAN)}
                                control={<Radio />}
                            />
                            <FormControlLabel
                                key={`option-flavor-american`}
                                label="American"
                                value={OptionFlavor.AMERICAN}
                                control={<Radio />}
                                onChange={handleChangeFlavor.bind(null, OptionFlavor.AMERICAN)}
                            />
                        </RadioGroup>
                    </FormControl>

                    <Button
                        className={classes.submitBtn}
                        variant="contained"
                        onClick={handlePublishOption}
                        disabled={!checkFormIsValid()}
                    >
                        Publish Option
                    </Button>
                </div>
                <div className={clsx(classes.imageContainer, !formState.asset && classes.dummyImageContainer)}>
                    {formState.asset ? (
                        <img src={formState.asset.image} alt="" />
                    ) : (
                        Array.from({length: 3}).map((_, i) => <div key={`dot-${i}`} className={classes.dot} />)
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default CreateOption;
