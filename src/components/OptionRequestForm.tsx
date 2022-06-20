
// @ts-ignore
import classes from "./styles/PublishOptionDetailsInput.module.scss";

import {
    Button,
    FormControl,
    FormControlLabel,
    InputAdornment,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField
} from "@mui/material";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import Layout from "./Layout";
import { useAccount, useContracts } from "../providers/contexts";
import { BIGNUMBER0, floatNumberRegex, SECONDS_IN_A_DAY } from "../utils/constants";
import { NFTAsset, OptionFlavor, OptionRequest } from "../utils/types";
import { ethers } from "ethers";
import { fetchAssetsOfAccount, fetchNFTImage } from "../utils/NFT/localhost";
import { showToast } from "../utils/frontend";

const defaultOptionRequest: OptionRequest =
{
    nftContract : ""
,   nftId       : BIGNUMBER0
,   interval    : "1"
,   premium     : "1"
,   strikePrice : "1"
,   flavor      : OptionFlavor.AMERICAN
};

const createRadio = (flavor, cb) =>
{
    let name = flavor === OptionFlavor.AMERICAN ? "American" : "European";

    return (
        <FormControlLabel
            key={`option-flavor-${name}`}
            label={name}
            value={flavor}
            control={<Radio />}
            onChange={cb.bind(null, flavor)}
        />
    );
}

const createTextBox = (fieldName, fieldP, cb) =>
{
    let label = "";
    let description = "";
    let inputProps = { endAdornment: "" };

    if (fieldName === "premium")
    {
        label = "Premium";
        description = fieldName;
        inputProps.endAdornment = "ETH";
    }

    if (fieldName === "strikePrice")
    {
        label = "Strike Price";
        description = "strike price";
        inputProps.endAdornment = "ETH";
    }

    if (fieldName === "interval")
    {
        label = "Interval";
        description = "expiration interval";
        inputProps["inputProps"] = { min: 1, max: 30 };
        inputProps.endAdornment = "days";
    }

    return (
        <div className={classes.fieldWrapper}>
            <label>{label}</label>
            <TextField
                key={`input-${fieldName}`}
                InputProps={inputProps}
                placeholder={`Enter the ${description}`}
                type={fieldName === "interval" ? "number" : ""}
                className={classes.field}
                value={fieldP[fieldName]}
                onChange={cb()}
            />
        </div>
    );
}

const isValid = (request) =>
{
    return  request.nftContract != ""
            && request.premium != ""
            && request.strikePrice != ""
            && request.interval != "";
};

const getInterval = (value) =>
{
    return Math.max(1, Math.min(parseInt(value), 30));
}

const getFloatString = (value) =>
{
    return  floatNumberRegex.test(value)
            && parseFloat(value) > 0
            ?   value
            :   "";
}

let index = 0;

function PublishOptionDetailsInput()
{
    const account = useAccount();
    const { nftOpt } = useContracts();

    const optionR = useRef<OptionRequest>(defaultOptionRequest);

    const [ metadata, setMetadata ] = useState<string>("");
    const [ assets, setAssets ] = useState<NFTAsset[]>([]);

    const [, doReload ] = useState(index);
    function reload() { index ^= 1; doReload(index); }

    useEffect
    (
        () =>
        {
            fetchAssetsOfAccount(account)
            .then( a => setAssets(a) )
        }
    ,   []
    );

    const onSetAsset = async (asset: NFTAsset) =>
    {
        if (asset.tokenId && !asset.image) fetchNFTImage(asset.address, asset.tokenId).then(r => setMetadata(r) );

        optionR.current.nftContract = asset?.address ?? "";
        optionR.current.nftId       = asset?.tokenId ?? BIGNUMBER0;
    };

    const onSetAmount = (propName: keyof OptionRequest, event: React.ChangeEvent<HTMLInputElement>) =>
    {
        optionR.current[propName.toString()] = getFloatString(event.target.value);

        reload();
    };

    const onSetInterval = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        optionR.current.interval = "";

        if (event.target.value)
        {
            optionR.current.interval = getInterval(event.target.value).toString();
        }

        reload();
    };

    const onSetFlavor = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        optionR.current.flavor = parseInt(event.target.value) as OptionFlavor;
    };

    const onPublishOptionRequest = () =>
    {
        showToast
        (
            nftOpt.publishOptionRequest
            (
                optionR.current.nftContract
            ,   optionR.current.nftId
            ,   ethers.utils.parseEther(optionR.current.strikePrice)
            ,   parseInt(optionR.current.interval) * SECONDS_IN_A_DAY
            ,   optionR.current.flavor
            ,   { value: ethers.utils.parseEther(optionR.current.premium) }
            )
            .then
            (
                () =>
                {
                    optionR.current = defaultOptionRequest;

                    reload();
                }
            )
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
                            value={optionR.current.nftId + "_" + optionR.current.nftContract}
                        >
                            <MenuItem
                                value={"0_"}
                                onClick={onSetAsset.bind(null, null)}
                            >
                                <i>Select an NFT</i>
                            </MenuItem>
                            <hr/>
                            {
                                assets.map
                                (
                                    asset =>
                                    (
                                        <MenuItem
                                            key={`asset-${asset.id}`}
                                            value={asset.tokenId + "_" + asset.address}
                                            onClick={onSetAsset.bind(null, asset)}
                                        >
                                            {asset.name}
                                        </MenuItem>
                                    )
                                )
                            }
                        </Select>
                    </div>

                    { createTextBox("premium"    , optionR.current, () => onSetAmount.bind(this, "premium") ) }
                    { createTextBox("strikePrice", optionR.current, () => onSetAmount.bind(this, "strikePrice") ) }
                    { createTextBox("interval"   , optionR.current, () => onSetInterval ) }

                    <FormControl className={classes.field}>
                        <label>Option Flavor</label>
                        <RadioGroup defaultValue={OptionFlavor.AMERICAN}>
                            { createRadio(OptionFlavor.AMERICAN, () => onSetFlavor) }
                            { createRadio(OptionFlavor.EUROPEAN, () => onSetFlavor) }
                        </RadioGroup>
                    </FormControl>

                    <Button
                        className={classes.submitBtn}
                        variant="contained"
                        onClick={onPublishOptionRequest}
                        disabled={!isValid(optionR.current)}
                    >
                        Publish Option
                    </Button>
                </div>

                <div className={clsx(classes.imageContainer, !metadata && classes.dummyImageContainer)}>
                {
                    metadata
                    ?   <img src={metadata} alt="NFT Metadata" />
                    :   Array.from({ length: 3 }).map((_, i) => <div key={`dot-${i}`} className={classes.dot} />)
                }
                </div>

            </div>
        </Layout>
    );
}

export default PublishOptionDetailsInput;