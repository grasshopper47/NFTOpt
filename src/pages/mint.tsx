// @ts-ignore
import classes from "../styles/components/MintForm.module.scss";

import React, { useEffect, useState } from "react";
import Image from "next/image";

import { Collection_BASE } from "../../typechain-types";
import { network } from "../../datasources/provider";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { NFTOptCollections } from "../../datasources/ERC-721/NFTOptCollections";
import { assetsOf } from "../../datasources/assets";
import { AssetKey, stringOf } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { clearNFTCollectionsEventCallback, setNFTCollectionsEventCallback } from "../controllers/NFTOptCollections";
import { useAccount, useChainID, clearNFTCollectionsLoadCallback, setNFTCollectionsLoadCallback, clearAssetsLoadCallback, setAssetsLoadCallback } from "../utils/contexts";
import { showToast } from "../utils/toasting";
import { signer } from "../utils/metamask";
import Layout from "../fragments/Layout";
import DropDown_MintForm from "../fragments/DropDown.Collections.MintForm";
import List_MintForm from "../fragments/List.Assets.MintForm";
import { Button } from "@mui/material";

const setAsset = (obj?: NFTAsset | null) =>
{
    if (obj) asset = obj as NFTAsset;
    else resetAsset();

    setImage(asset.image);
};

const handleMint = () => showToast
(
    ( getCachedContract(asset.key.nftContract) as Collection_BASE )
    .connect(signer)
    .mint()
    .then( () => setAsset(null) )
);

const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) =>
{
    if (event.key === "Enter") if (asset.image) handleMint();
}

const resetAsset = () =>
{
    asset =
    {
        key :
        {
            nftId       : ""
        ,   nftContract : ""
        } as AssetKey
    ,   name  : ""
    ,   image : ""
    }
}

const cleanup = () =>
{
    clearAssetsLoadCallback();

    clearNFTCollectionsLoadCallback();
    clearNFTCollectionsEventCallback();
}

let chainID     : number;
let account     : string;
let image       : string;
let asset       : NFTAsset;
let assets      : NFTAsset[];
let collections : NFTAsset[];

let setImage       : (a : string)     => void;
let setCollections : (a : NFTAsset[]) => void;
let assetsChanged  : () => void;

resetAsset();

function MintForm()
{
    const [       , setAssetsChanged ] = useState(0);
    [ image       , setImage ]         = useState(asset.image);
    [ collections , setCollections ]   = useState<NFTAsset[]>(NFTOptCollections);

    assetsChanged = () => setAssetsChanged(f => f ^ 1);

    account = useAccount();
    chainID = useChainID();

    assets = assetsOf(account);

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
                clearNFTCollectionsLoadCallback();
                clearNFTCollectionsEventCallback();

                return;
            }

            setNFTCollectionsLoadCallback(setCollections);
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
        <p className="page-title">Mint an NFT frosm our collections</p>

        <div
            className={classes.root}
            onKeyDown={handleKey}>

            <div className={classes.form}>
                <DropDown_MintForm
                    list={collections}
                    value={ asset.key.nftContract !== "" ? stringOf(asset.key) : undefined }
                    onChange={setAsset}
                />

                <List_MintForm
                    items={assets}
                    onChange={setImage}
                />

                <Button
                    className={classes.btnMint}
                    variant="contained"
                    onClick={handleMint}
                    disabled={!asset.image}
                >Mint</Button>
            </div>

            <div className={classes.imageContainer}>
            {
                image
                ?   <Image style={{borderRadius: "10px"}} src={image} alt="NFT image data" width="374" height="374" />
                :   [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> )
            }
            </div>
        </div>
    </Layout>;
}

export default MintForm;
