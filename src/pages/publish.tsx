// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import { network } from "../../datasources/provider";
import { contracts } from "../../datasources/NFTOpt";
import { assetsOf } from "../../datasources/assets";
import { imageOf, loadImage } from "../../datasources/ERC-721/images";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { AssetKey, isValid, stringOf } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { Request_DISPLAY } from "../../models/request";
import { OptionFlavor } from "../../models/enums";
import { clearNFTCollectionsEventCallback, setNFTCollectionsEventCallback } from "../controllers/NFTOptCollections";
import { clearAssetsLoadCallback, setAssetsLoadCallback, useAccount, useChainID } from "../utils/contexts";
import { ADDRESS0, SECONDS_IN_A_DAY } from "../../utils/constants";
import { getFloatString, getIntervalString } from "../utils/helpers";
import { showToast } from "../utils/toasting";
import { signer } from "../utils/metamask";
import TextBox_RequestForm from "../fragments/TextBox.Request";
import DropDown_RequestForm from "../fragments/DropDown.Assets.RequestForm";
import DropDown_Flavor_RequestForm from "../fragments/DropDown.Flavor.RequestForm";
import CustomAssetForm from "../components/CustomAssetForm"
import Layout from "../fragments/Layout";
import { Button, SelectChangeEvent } from "@mui/material";

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

    const image = imageOf(assetKey);

    if (image) setImage(image);
    else       loadImage(assetKey).then( img => { asset.image = img; setImage(img); } );
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
    .then( () => { resetRequest(), requestChanged() } )
);

const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) =>
{
    if (event.key === "Enter") if (isRequestValid()) handlePublish();
}

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

    request = {} as Request_DISPLAY;

    request.interval    = "3";
    request.premium     = "0.1";
    request.strikePrice = "1";
    request.flavor      = OptionFlavor.AMERICAN;

    areAmountsInvalid = false;
}

const cleanup = () =>
{
    clearAssetsLoadCallback();

    clearNFTCollectionsEventCallback();
}

let areAmountsInvalid : boolean;
let showCustom        : boolean;
let chainID           : number;
let account           : string;
let image             : string;
let assets            : NFTAsset[];
let assetKey          : AssetKey
let request           : Request_DISPLAY;

let setShowCustom  : (a : boolean) => void;
let setImage       : (a : string)  => void;
let requestChanged : () => void;
let assetsChanged  : () => void;

resetRequest();

function RequestForm()
{
    const [      , setAssetsChanged ]  = useState(0);
    const [      , setRequestChanged ] = useState(0);
    [ image      , setImage ]          = useState(imageOf(assetKey));
    [ showCustom , setShowCustom ]     = useState(false);

    account = useAccount();
    chainID = useChainID();

    assets = assetsOf(account);

    requestChanged = () => setRequestChanged(f => f ^ 1);
    assetsChanged  = () => setAssetsChanged(f => f ^ 1);

    useEffect
    (
        () =>
        {
            return () => cleanup();
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network)
            {
                clearNFTCollectionsEventCallback();

                return;
            }

            setNFTCollectionsEventCallback(assetsChanged);
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (account === "")
            {
                clearAssetsLoadCallback();

                return;
            }

            setAssetsLoadCallback(assetsChanged);
        }
    ,   [account]
    );

    return <Layout>
        <p className="page-title">Publish a Request for PUT Option</p>

        <div className={classes.root}>
            <div className={classes.form}>
                {
                    showCustom
                    ?   <CustomAssetForm
                            onSuccess=
                            {
                                () =>
                                {
                                    setAsset(assets[assets.length - 1]);
                                    setShowCustom(false);
                                }
                            }
                            onCancel={ () => setShowCustom(false) }
                        />
                    :   <>
                            <DropDown_RequestForm
                                list={assets}
                                onChange={setAsset}
                                value={ assetKey.nftContract !== "" ? stringOf(assetKey) : undefined }
                            />

                            <Button
                                className={classes.btnAddContract}
                                size="small"
                                onClick=
                                {
                                    () =>
                                    {
                                        setShowCustom(true);
                                        // let contract = getCachedContract(assetKey.nftContract);

                                        // Revoke approval
                                        // contract.connect(signer).approve(ADDRESS0, assetKey.nftId);

                                        // Transfer NFT from connected to another account
                                        // contract.connect(signer).transferFrom(account, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", assetKey.nftId)
                                        // .then(console.log);
                                    }
                                }
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

            <div className={classes.imageContainer}>
            {
                assetKey.nftContract
                ?   <Image style={{borderRadius: "10px"}} src={image} alt="NFT image data" width="374" height="374" />
                :   [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> )
            }
            </div>
        </div>
    </Layout>;
}

export default RequestForm;
