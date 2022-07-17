// @ts-ignore
import classes from "./styles/RequestForm.module.scss";
import clsx from "clsx";

import React, { useEffect } from "react";
import { Button, SelectChangeEvent, TextField } from "@mui/material";
import { useState } from "react";
import { ethers } from "ethers";
import { useAccount, useContracts } from "../../pages/_app";
import { loadAssetsFor } from "../../datasources/NFT/localhost";
import { imageOf, stringOf, loadNFTImage, isValid } from "../../datasources/NFTAssets";
import { AssetKey, NFTAsset } from "../../models/nftAsset";
import { OptionRequest_DISPLAY } from "../../models/extended";
import { OptionFlavor } from "../../models/option";
import { SECONDS_IN_A_DAY } from "../../utils/constants";
import { getFloatString, getIntervalString } from "../utils/helpers";
import { showToast } from "../utils/toasting";
import TextBox_RequestForm from "../fragments/TextBox.Request";
import DropDown_RequestForm from "../fragments/DropDown.Assets.Request";
import DropDown_Flavor_RequestForm from "../fragments/DropDown.Flavor.RequestForm";
import CustomAssetForm from "./CustomAssetForm";

let request  = {} as OptionRequest_DISPLAY;
let assetKey = {} as AssetKey

let areAmountsInvalid = false;

const isRequestValid = () =>
{
    return isValid(assetKey)
        && request.premium     !== ""
        && request.strikePrice !== ""
        && request.interval    !== ""
        && !areAmountsInvalid;
}

const resetRequest = () =>
{
    assetKey = { nftId : "", nftContract: "" };

    request.interval        = "3";
    request.premium         = "0.1";
    request.strikePrice     = "1";
    request.flavor          = OptionFlavor.AMERICAN;

    areAmountsInvalid = false;
}

resetRequest();

function RequestForm()
{
    const [                , setRequestChanged ]  = useState(0);
    const [ image          , setImage ]           = useState("");
    const [ assets         , setAssets ]          = useState<NFTAsset[]>([]);
    const [ showAddContract, setShowAddContract ] = useState(false);

    const requestChanged = () => setRequestChanged(f => f ^ 1);

    const account   = useAccount();
    const contracts = useContracts();

    useEffect
    (
        () => { loadAssetsFor(account).then(setAssets); }
    ,   [account]
    );

    console.log(assetKey, stringOf(assetKey));

    const setAsset = (asset : NFTAsset | undefined | null) =>
    {
        console.log("setAsset");

        if (asset == null)
        {
            assetKey = { nftId : "", nftContract: "" };

            setImage("");

            return;
        }

        assetKey = asset.key;

        let image = imageOf(assetKey);

        if (image) setImage(image);
        else       loadNFTImage(assetKey).then(setImage);
    };

    const setAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request[event.target.id] = getFloatString(event.target.value);
        areAmountsInvalid = parseFloat(request.premium) >= parseFloat(request.strikePrice);
        requestChanged();
    };

    const setInterval = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        request.interval = getIntervalString(event.target.value);
        requestChanged();
    };

    const setFlavor = (event: SelectChangeEvent<OptionFlavor>) =>
    {
        request.flavor = event.target.value as OptionFlavor;
        requestChanged();
    }

    const handlePublish = () =>
    {
        showToast
        (
            contracts.NFTOpt.publishRequest
            (
                assetKey.nftContract
            ,   assetKey.nftId
            ,   ethers.utils.parseEther(request.strikePrice)
            ,   parseInt(request.interval) * SECONDS_IN_A_DAY
            ,   request.flavor
            ,   { value: ethers.utils.parseEther(request.premium) }
            )
            .then( () => { resetRequest(); setImage(""); } )
        );
    };

    const handleCustomContract = () =>
    {
        setAsset(assets[assets.length - 1]);
        setShowAddContract(false);
    }

    const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) => { if (isRequestValid() && event.key === "Enter") handlePublish(); }

    return <>
        <p className="page-title">Request a PUT Option</p>

        <div className={classes.root}>
            <div className={classes.form}>
                {
                    showAddContract
                    ?   <CustomAssetForm
                            onSuccess={handleCustomContract}
                            onCancel={ () => setShowAddContract(false) }
                        />
                    :   <>
                            <DropDown_RequestForm
                                value={stringOf(assetKey)}
                                list={assets}
                                onChange={setAsset}
                            />

                            <Button
                                className={classes.btnAddContract}
                                size="small"
                                onClick={ () => setShowAddContract(true) }
                            >🆕</Button>
                        </>
                }

                <div className={classes.twoFieldWrapper}>
                    <TextBox_RequestForm fieldName="premium"
                        value={request.premium}
                        onChange={setAmount}
                        onKeyUp={handleKey}
                        { ... areAmountsInvalid && { errorText : "Must be less than Strike Price" } }/>

                    <TextBox_RequestForm fieldName="strikePrice"
                        value={request.strikePrice}
                        onChange={setAmount}
                        onKeyUp={handleKey}
                        { ... areAmountsInvalid && { errorText : "Must be greater than Premium" } }/>
                </div>

                <div className={classes.twoFieldWrapper}>
                    <TextBox_RequestForm fieldName="interval"
                        value={request.interval}
                        onChange={setInterval}
                        onKeyUp={handleKey} />

                    <DropDown_Flavor_RequestForm
                        value={request.flavor}
                        onChange={setFlavor} />
                </div>

                <Button
                    className={classes.btnPublishRequest}
                    variant="contained"
                    onClick={handlePublish}
                    disabled={!isRequestValid()}
                >Publish Request</Button>

            </div>

            <div className={clsx(classes.imageContainer, !assetKey.nftContract && classes.dummyImageContainer)}>
            {
                assetKey.nftContract
                ?   <img src={image} alt="NFT image data"/>
                :   [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> )
            }
            </div>
        </div>
    </>;
}

export default RequestForm;
