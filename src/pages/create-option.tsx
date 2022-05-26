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
    Typography,
} from "@mui/material";
import clsx from "clsx";
import React, {useEffect, useState} from "react";
import Layout from "../components/Layout";
import {useAccount, useContracts} from "../providers/contexts";
import {floatNumberRegex} from "../utils";
import {NFTAsset, OptionFlavor} from "../utils/declarations";
import classes from "./styles/CreateOption.module.scss";
import {ethers} from "ethers";
import {dummyNFT} from "../utils/dummyData";
import toast from "react-hot-toast";

type FormState = {
    asset?: NFTAsset;
    strikePrice?: string;
    premium?: string;
    interval?: string;
    flavor?: OptionFlavor;
};

function CreateOption() {
    const account = useAccount();
    const {nftOpt} = useContracts();

    // TODO Stefana: cleanup dummy data
    const [assets, setAssets] = useState<NFTAsset[]>([dummyNFT]);
    const [formState, setFormState] = useState<FormState>({
        asset: dummyNFT,
        strikePrice: "",
        premium: "",
        interval: "",
        flavor: OptionFlavor.EUROPEAN,
    });

    useEffect(() => {
        if (!account) {
            return;
        }
        // fetchAssetsForAddress(account, setAssets);
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
            !missingFormFields &&
            parseFloat(formState.premium) !== 0 &&
            formState.premium != null &&
            formState.premium != "" &&
            parseFloat(formState.strikePrice) !== 0 &&
            formState.strikePrice != null &&
            formState.strikePrice != "" &&
            formState.interval != null &&
            formState.interval != ""
        );
    };

    const handleChangeInterval = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.value) {
            setFormState((prev) => ({
                ...prev,
                interval: "",
            }));

            return;
        }

        setFormState((prev) => ({
            ...prev,
            interval: Math.max(1, Math.min(parseInt(event.target.value), 30)).toString(),
        }));
    };

    const handlePublishOption = async () => {
        const txOptions = {
            value: ethers.utils.parseEther(`${parseFloat(formState.premium)}`),
            gasLimit: 100000,
        };

        try {
            await nftOpt.publishOptionRequest(
                formState.asset.address,
                formState.asset.tokenId,
                ethers.utils.parseEther(`${parseFloat(formState.strikePrice)}`),
                parseInt(formState.interval) * 24 * 3600, // days in seconds
                formState.flavor,
                txOptions
            );
            toast.success("Option published successfully", {duration: 4000});
        } catch (error) {
            toast.error("There was an error while trying to publish the option", {duration: 4000});
            console.error(error);
        }
    };

    return (
        <Layout>
            <div className={classes.root}>
                <div className={classes.form}>
                    <Typography className={classes.title}>Buy an NFT Option</Typography>
                    <Select value={formState.asset?.id} placeholder="Select your NFT">
                        <Typography>Select your NFT</Typography>
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
                    <TextField
                        key={`input-premium`}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                        }}
                        placeholder="Premium"
                        className={classes.field}
                        value={formState.premium}
                        onChange={handleChangeFieldString.bind(this, "premium")}
                    />
                    <TextField
                        key={`input-strike-price`}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                        }}
                        placeholder="Strike price"
                        className={classes.field}
                        value={formState.strikePrice}
                        onChange={handleChangeFieldString.bind(this, "strikePrice")}
                    />
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
                        placeholder="Expiration interval"
                        className={classes.field}
                        value={formState.interval}
                        onChange={handleChangeInterval}
                    />
                    <FormControl className={classes.field}>
                        <FormLabel id="demo-radio-buttons-group-label">Option Flavor</FormLabel>
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
