// @ts-ignore
import classes from "./styles/OptionRequestForm.module.scss";
import clsx from "clsx";

import { Button, FormControl, RadioGroup } from "@mui/material";
import { useState } from "react";
import { ethers } from "ethers";
import { loadNFTImage } from "../../datasources/NFTAssets";
import { imageOf, keyOf } from "../../datasources/globals";
import { OptionFlavor } from "../../models/option";
import { showToast } from "../utils/toasting";
import { useContracts } from "../../pages/_app";
import { NFTAsset } from "../../models/nftAsset";
import { BIGNUMBER0, SECONDS_IN_A_DAY } from "../../utils/constants";
import { getFloatString, getIntervalString } from "../utils/helpers";
import TextBox_OptionRequestForm from "../fragments/TextBox.OptionRequest";
import Radio_OptionRequestForm from "../fragments/Radio.OptionRequest";
import DropDown_OptionRequestForm from "../fragments/DropDown.OptionRequest";
import { OptionRequest_DISPLAY } from "../../models/extended";

const createRequest = (obj : OptionRequest_DISPLAY) =>
{
    obj.nftContract = "";
    obj.nftId       = BIGNUMBER0;
    obj.interval    = "1";
    obj.premium     = "1";
    obj.strikePrice = "1";
    obj.flavor      = OptionFlavor.AMERICAN;
}

const isValid = (request : OptionRequest_DISPLAY) =>
{
    return request.nftContract !== ""
        && request.premium     !== ""
        && request.strikePrice !== ""
        && request.interval    !== ""
}

let request = { } as OptionRequest_DISPLAY;
createRequest(request);

function OptionRequestForm()
{
    const [ image, setImage ]          = useState("");
    const [ flag , setRequestChanged ] = useState(0);
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
        // setRequestState( prev => ({ ...prev, [event.target.id] : getFloatString(event.target.value) }) );

        request[event.target.id] = getFloatString(event.target.value); requestChanged();
    };

    const setInterval = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        // setRequestState( prev => ({ ...prev, interval : getIntervalString(event.target.value) }) );

        request.interval = getIntervalString(event.target.value); requestChanged();
    };

    const setFlavor = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request.flavor = parseInt(event.target.value) as OptionFlavor; requestChanged();
    };

    const onPublishRequest = () =>
    {
        showToast
        (
            contracts.NFTOpt.publishOptionRequest
            (
                request.nftContract
            ,   request.nftId
            ,   ethers.utils.parseEther(request.strikePrice)
            ,   parseInt(request.interval) * SECONDS_IN_A_DAY
            ,   request.flavor
            ,   { value: ethers.utils.parseEther(request.premium) }
            )
            .then( () => { createRequest(request); requestChanged(); } )
            // .then(() => setRequestState({...defaultRequest}))
        );
    };

    const onHandleKey = (event: React.KeyboardEvent<HTMLInputElement>) => { if (isValid(request) && event.key === "Enter") onPublishRequest(); }

    const create3Dots = () => [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> );

    return <>
        <p className="page-title">Request a PUT Option</p>

        <div className={classes.root}>
            <div className={classes.form}>

                <DropDown_OptionRequestForm value={keyOf(request)} setAsset={setAsset}/>

                <TextBox_OptionRequestForm fieldName="premium"     value={request.premium}     onChange={setAmount}   onKeyUp={onHandleKey} />
                <TextBox_OptionRequestForm fieldName="strikePrice" value={request.strikePrice} onChange={setAmount}   onKeyUp={onHandleKey} />
                <TextBox_OptionRequestForm fieldName="interval"    value={request.interval}    onChange={setInterval} onKeyUp={onHandleKey} />

                <FormControl className={classes.field}>
                    <RadioGroup defaultValue={OptionFlavor.AMERICAN}>
                        <Radio_OptionRequestForm flavor={OptionFlavor.AMERICAN} value={request.flavor} onChange={setFlavor} onKeyUp={onHandleKey} />
                        <Radio_OptionRequestForm flavor={OptionFlavor.EUROPEAN} value={request.flavor} onChange={setFlavor} onKeyUp={onHandleKey} />
                    </RadioGroup>
                </FormControl>

                <Button
                    id="btnPublish"
                    className={classes.submitBtn}
                    variant="contained"
                    onClick={onPublishRequest}
                    disabled={!isValid(request)}
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

export default OptionRequestForm;