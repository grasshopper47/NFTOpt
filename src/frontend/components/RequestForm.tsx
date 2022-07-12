// @ts-ignore
import classes from "./styles/RequestForm.module.scss";
import clsx from "clsx";

import React from "react";
import { Button, FormControl, RadioGroup } from "@mui/material";
import { useState } from "react";
import { ethers } from "ethers";
import { useContracts } from "../../pages/_app";
import { imageOf, keyOf, loadNFTImage } from "../../datasources/NFTAssets";
import { NFTAsset } from "../../models/nftAsset";
import { OptionRequest_DISPLAY } from "../../models/extended";
import { OptionFlavor } from "../../models/option";
import { BIGNUMBER0, SECONDS_IN_A_DAY } from "../../utils/constants";
import { getFloatString, getIntervalString } from "../utils/helpers";
import { showToast } from "../utils/toasting";
import TextBox_RequestForm from "../fragments/TextBox.Request";
import Radio_RequestForm from "../fragments/Radio.Request";
import DropDown_RequestForm from "../fragments/DropDown.Request";

let request = { } as OptionRequest_DISPLAY;
let intervalInDays = "0";

const resetRequest = () =>
{
    request.nftContract = "";
    request.nftId       = BIGNUMBER0;
    request.interval    = "86400";
    request.premium     = "0.1";
    request.strikePrice = "1";
    request.flavor      = OptionFlavor.AMERICAN;

    intervalInDays = "1";
}

resetRequest();

const isRequestOK = () =>
{
    return request.nftContract !== ""
        && request.premium     !== ""
        && request.strikePrice !== ""
        && request.interval    !== ""
}

function RequestForm()
{
    const [ image , setImage ]          = useState("");
    const [ flag  , setRequestChanged ] = useState(0);
    const requestChanged = () => setRequestChanged(flag ^ 1);

    const contracts = useContracts();

    const setAsset = (asset? : NFTAsset | null) =>
    {
        // Triggered by dropdown to refresh the image
        if (asset === undefined)
        {
            setImage(imageOf(request));

            return;
        }

        if (asset === null)
        {
            request.nftId       = BIGNUMBER0;
            request.nftContract = "";

            setImage("");

            return;
        }

        console.log("setAsset");

        request.nftId       = asset.nftId;
        request.nftContract = asset.nftContract;

        let image = imageOf(request);

        if (image) setImage(image);
        else       loadNFTImage(request.nftContract, request.nftId).then(setImage);
    };

    const setAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request[event.target.id] = getFloatString(event.target.value); requestChanged();
    };

    const setInterval = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request.interval = getIntervalString(event.target.value);
        intervalInDays = Math.floor(parseInt(request.interval) / SECONDS_IN_A_DAY).toString();
        requestChanged();
    };

    const setFlavor = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request.flavor = parseInt(event.target.value) as OptionFlavor; requestChanged();
    };

    const onPublishRequest = () =>
    {
        showToast
        (
            contracts.NFTOpt.publishRequest
            (
                request.nftContract
            ,   request.nftId
            ,   ethers.utils.parseEther(request.strikePrice)
            ,   request.interval
            ,   request.flavor
            ,   { value: ethers.utils.parseEther(request.premium) }
            )
            .then( () => { resetRequest(); requestChanged(); } )
        );
    };

    const onHandleKey = (event: React.KeyboardEvent<HTMLInputElement>) => { if (isRequestOK() && event.key === "Enter") onPublishRequest(); }

    const create3Dots = () => [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> );

    return <>
        <p className="page-title">Request a PUT Option</p>

        <div className={classes.root}>
            <div className={classes.form}>

                <DropDown_RequestForm value={keyOf(request)} setAsset={setAsset}/>

                <TextBox_RequestForm fieldName="premium"     value={request.premium}     onChange={setAmount}   onKeyUp={onHandleKey} />
                <TextBox_RequestForm fieldName="strikePrice" value={request.strikePrice} onChange={setAmount}   onKeyUp={onHandleKey} />
                <TextBox_RequestForm fieldName="interval"    value={intervalInDays}      onChange={setInterval} onKeyUp={onHandleKey} />

                <FormControl className={classes.field}>
                    <RadioGroup defaultValue={OptionFlavor.AMERICAN}>
                        <Radio_RequestForm flavor={OptionFlavor.AMERICAN} value={request.flavor} onChange={setFlavor} onKeyUp={onHandleKey} />
                        <Radio_RequestForm flavor={OptionFlavor.EUROPEAN} value={request.flavor} onChange={setFlavor} onKeyUp={onHandleKey} />
                    </RadioGroup>
                </FormControl>

                <Button
                    className={classes.submitBtn}
                    variant="contained"
                    onClick={onPublishRequest}
                    disabled={!isRequestOK()}
                >
                    Publish Request
                </Button>

            </div>

            <div className={clsx(classes.imageContainer, !request.nftContract && classes.dummyImageContainer)}>
                { request.nftContract ? <img src={image} alt="NFT image data"/> : create3Dots() }
            </div>
        </div>
    </>;
}

export default RequestForm;
