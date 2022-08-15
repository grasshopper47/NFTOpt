// @ts-ignore
import classes from "./styles/RequestForm.module.scss";
import clsx from "clsx";

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { network } from "../../datasources/provider";
import { contracts } from "../../datasources/NFTOpt";
import { assetsOf, loadAssetsFor } from "../../datasources/assets";
import { imageOf, loadImage } from "../../datasources/ERC-721/images";
import { AssetKey, isValid, stringOf } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { Request_DISPLAY } from "../../models/request";
import { OptionFlavor } from "../../models/enums";
import { SECONDS_IN_A_DAY } from "../../utils/constants";
import { getFloatString, getIntervalString } from "../utils/helpers";
import { showToast } from "../utils/toasting";
import TextBox_RequestForm from "../fragments/TextBox.Request";
import DropDown_RequestForm from "../fragments/DropDown.Assets.RequestForm";
import DropDown_Flavor_RequestForm from "../fragments/DropDown.Flavor.RequestForm";
import CustomAssetForm from "./CustomAssetForm";
import { Button, SelectChangeEvent } from "@mui/material";
import { clearNFTCollectionsEventCallback, setNFTCollectionsEventCallback } from "../controllers/NFTOptCollections";
import { useAccount, useChainID } from "../utils/contexts";

const setAsset = (asset : NFTAsset | undefined | null) =>
{
    console.log("setAsset");

    if (asset == null)
    {
        assetKey = { nftId : "", nftContract: "" };

        _setImageCallback("");

        return;
    }

    assetKey = asset.key;

    let image = imageOf(assetKey);

    if (image) _setImageCallback(image);
    else       loadImage(assetKey).then( img => { asset.image = img; _setImageCallback(img); } );
};

const setAmount = (event: React.ChangeEvent<HTMLInputElement>) =>
{
    request[event.target.id] = getFloatString(event.target.value);
    areAmountsInvalid = parseFloat(request.premium) >= parseFloat(request.strikePrice);
    _requestChangedCallback();
};

const setInterval = (event: React.ChangeEvent<HTMLInputElement>) =>
{
    request.interval = getIntervalString(event.target.value);
    _requestChangedCallback();
};

const setFlavor = (event: SelectChangeEvent<OptionFlavor>) =>
{
    request.flavor = event.target.value as OptionFlavor;
    _requestChangedCallback();
}

const handlePublish = () => showToast
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
    .then( () => { resetRequest(), _requestChangedCallback() } )
);

const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) =>
{
    if (event.key === "Enter") if (isRequestValid()) handlePublish();
}

let request  = {} as Request_DISPLAY;
let assetKey = {} as AssetKey

let areAmountsInvalid = false;

let account : string;
let chainID : number;
let assets  : NFTAsset[];

let isRequestValid = () =>
{
    return isValid(assetKey)
        && request.premium     !== ""
        && request.strikePrice !== ""
        && request.interval    !== ""
        && !areAmountsInvalid;
}

let resetRequest = () =>
{
    assetKey = { nftId : "", nftContract: "" };

    request.interval    = "3";
    request.premium     = "0.1";
    request.strikePrice = "1";
    request.flavor      = OptionFlavor.AMERICAN;

    areAmountsInvalid = false;
}

let _setImageCallback       : (img : string) => void;
let _requestChangedCallback : () => void;

resetRequest();

function RequestForm()
{
    const [                 , setAssetsChanged ]   = useState(0);
    const [                 , setRequestChanged ]  = useState(0);
    const [ image           , setImage ]           = useState(imageOf(assetKey));
    const [ showAddContract , setShowAddContract ] = useState(false);

    account = useAccount();
    chainID = useChainID();

    assets = assetsOf(account) ?? [];

    _setImageCallback       = setImage;
    _requestChangedCallback = () => setRequestChanged(f => f ^ 1);
    let assetsChanged       = () => setAssetsChanged(f => f ^ 1);

    useEffect
    (
        () =>
        {
            clearNFTCollectionsEventCallback();

            if (!network) return;

            setNFTCollectionsEventCallback(assetsChanged);

            // Cleanup on unmount
            return () => { clearNFTCollectionsEventCallback(); }
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (!network) return;

            loadAssetsFor(account).then(assetsChanged);
        }
    ,   [account]
    );

    return <>
        <p className="page-title">Request a PUT Option</p>

        <div className={classes.root}>
            <div className={classes.form}>
                {
                    showAddContract
                    ?   <CustomAssetForm
                            onSuccess=
                            {
                                () =>
                                {
                                    setAsset(assets[assets.length - 1]);
                                    setShowAddContract(false);
                                }
                            }
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
