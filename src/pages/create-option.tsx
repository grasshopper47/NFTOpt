import {
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputAdornment,
    MenuItem,
    OutlinedInput,
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
import {fetchAssetsForAddress} from "../utils/api";
import {NFTAsset, OptionFlavor} from "../utils/declarations";
import classes from "./styles/CreateOption.module.scss";
import {DesktopDatePicker} from "@mui/lab";
import {isBefore} from "date-fns";

type FormState = {
    asset?: NFTAsset;
    strikePrice?: number;
    premium?: number;
    interval?: Date;
    flavor?: OptionFlavor;
};

function CreateOption() {
    const account = useAccount();
    const {nftOpt} = useContracts();

    const [assets, setAssets] = useState<NFTAsset[]>([]);

    const [formState, setFormState] = useState<FormState>({
        asset: null,
        strikePrice: null,
        premium: null,
        interval: null,
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

    const handleChangeFieldNumber = (field: keyof FormState, event: React.ChangeEvent<HTMLInputElement>) => {
        setFormState((prev) => ({
            ...prev,
            [field]: event.target.value ? parseInt(event.target.value) : null,
        }));
    };

    const handleChangeDate = (value: Date) => {
        if (isBefore(value, new Date())) {
            return;
        }
        setFormState((prev) => ({
            ...prev,
            interval: value,
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
            formState.premium !== 0 &&
            formState.premium != null &&
            formState.strikePrice !== 0 &&
            formState.strikePrice != null &&
            formState.interval &&
            !isBefore(formState.interval, new Date())
        );
    };

    // console.log(formState.asset.tokenId);

    const handlePublishOption = () => {
        nftOpt.publishOptionRequest(
            formState.asset.address,
            formState.asset.tokenId,
            formState.strikePrice,
            formState.interval.getTime(),
            formState.flavor,
            {value: formState.premium * 1e18} // TODO: how to send correct data?
        );
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
                    <OutlinedInput
                        key={`input-premium`}
                        placeholder="Premium"
                        className={classes.field}
                        value={formState.premium}
                        onChange={handleChangeFieldNumber.bind(this, "premium")}
                        endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
                    />
                    <OutlinedInput
                        key={`input-strike-price`}
                        placeholder="Strike price"
                        className={classes.field}
                        value={formState.strikePrice}
                        onChange={handleChangeFieldNumber.bind(this, "strikePrice")}
                        endAdornment={<InputAdornment position="end">ETH</InputAdornment>}
                    />
                    <DesktopDatePicker
                        inputFormat="MM/dd/yyyy"
                        className={classes.field}
                        value={formState.interval}
                        onChange={handleChangeDate}
                        renderInput={(params) => <TextField {...params} />}
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
