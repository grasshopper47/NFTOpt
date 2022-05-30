import {
    Button,
    FormControl,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
} from "@mui/material";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAccount, useContracts } from "../providers/contexts";
import { floatNumberRegex, networkName, SECONDS_IN_A_DAY } from "../utils/constants";
import { NFTAsset, OptionFlavor } from "../utils/types";
import classes from "./styles/CreateOption.module.scss";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { fetchAssetsOfAccount, fetchNFTImage } from "../utils/NFT/localhost";
import { setWaitingToastId } from "../utils/frontend";

type FormState = {
    asset?: NFTAsset;
    strikePrice?: string;
    premium?: string;
    interval: number;
    flavor?: OptionFlavor;
};

const defaultFormState: FormState = {
    asset: undefined,
    premium: "1",
    strikePrice: "1",
    interval: 1,
    flavor: OptionFlavor.AMERICAN
};

function CreateOption() {
    const account = useAccount();
    const { nftOpt } = useContracts();

    const [assets, setAssets] = useState<NFTAsset[]>([]);
    const [formState, setFormState] = useState<FormState>(defaultFormState);

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

    useEffect(() => { fetchAssetsOfAccount(account, setAssets); }, []);

    const handleSelectAsset = async (asset: NFTAsset) => {
        if (!asset.image) { asset.image = await fetchNFTImage(asset.address, asset.tokenId); }

        setFormState( prev => ({ ...prev, asset }) );
    };

    const onSetETHAmount = (propName: keyof FormState, event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState( prev => ({
            ...prev,
            [propName]: floatNumberRegex.test(event.target.value) ||
                        parseFloat(event.target.value) > 0
                        ? event.target.value : "0",
        }) );
    };

    const onSetFlavor = (flavor: OptionFlavor) => { setFormState( prev => ({ ...prev, flavor, }) ) };

    const onSetInterval = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.value) { event.target.value = ""; }

        setFormState( prev => ({
            ...prev,
            interval: Math.max(1, Math.min(parseInt(event.target.value), 30)),
        }) );
    };

    const handlePublishOption = async () => {

        let promise = nftOpt.publishOptionRequest(
            formState.asset.address,
            formState.asset.tokenId,
            ethers.utils.parseEther(`${parseFloat(formState.strikePrice)}`),
            formState.interval * SECONDS_IN_A_DAY,
            formState.flavor,
            { value: ethers.utils.parseEther(`${parseFloat(formState.premium)}`) }
        )
        .then( () => setFormState(defaultFormState) );

        toast.promise(
            promise,
            {
                loading: "Waiting for user to confirm...",
                success:
                () => {
                    setTimeout( () => setWaitingToastId(toast.loading(`Waiting for ${networkName} to confirm...`)), 2000);

                    return "Transaction sent";
                },
                error: "User canceled",
            },
            {
                loading: { duration: Infinity },
                success: { duration: 2000     },
                error:   { duration: 0        }
            },
        );
    };

    return (
        <Layout>
            <div className={classes.root}>
                <div className={classes.form}>
                    <p className={classes.title}>Request a PUT Option</p>
                    <div className={classes.fieldWrapper}>
                        <Select
                            MenuProps={{ classes: { paper: classes.menuPaper } }}
                            value={formState.asset?.id ?? -1}
                            placeholder="Select your NFT"
                        >
                            <MenuItem value={-1}>Select your NFT</MenuItem>
                            {assets.map((asset) => (
                                <MenuItem
                                    key={`asset-${asset.id}`}
                                    value={asset.id}
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
                            onChange={onSetETHAmount.bind(this, "premium")}
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
                            onChange={onSetETHAmount.bind(this, "strikePrice")}
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
                            onChange={onSetInterval}
                        />
                    </div>

                    <FormControl className={classes.field}>
                        <label>Option Flavor</label>
                        <RadioGroup defaultValue={OptionFlavor.AMERICAN}>
                            <FormControlLabel
                                key={`option-flavor-american`}
                                label="American"
                                value={OptionFlavor.AMERICAN}
                                control={<Radio />}
                                onChange={onSetFlavor.bind(null, OptionFlavor.AMERICAN)}
                            />
                            <FormControlLabel
                                key={`option-flavor-european`}
                                label="European"
                                value={OptionFlavor.EUROPEAN}
                                onChange={onSetFlavor.bind(null, OptionFlavor.EUROPEAN)}
                                control={<Radio />}
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
                        Array.from({ length: 3 }).map((_, i) => <div key={`dot-${i}`} className={classes.dot} />)
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default CreateOption;