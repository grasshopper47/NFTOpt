// @ts-ignore
import classes from "./styles/MintForm.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { network } from "../../datasources/provider";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { NFTOptCollections } from "../../datasources/ERC-721/NFTOptCollections";
import { assetsOf, loadAssetsFor } from "../../datasources/assets";
import { AssetKey } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { clearNFTCollectionsEventCallback, setNFTCollectionsEventCallback } from "../controllers/NFTOptCollections";
import { clearOptionsUICallback, useAccount, useChainID, setNFTCollectionsLoadCallback } from "../utils/contexts";
import { showToast } from "../utils/toasting";
import { signer } from "../utils/metamask";
import DropDown_MintForm from "../fragments/DropDown.Collections.MintForm";
import { Avatar, Button, ListItem, ListItemAvatar, ListItemText, ListSubheader, SelectChangeEvent } from "@mui/material";
import { List } from '@mui/material';

let setAsset = (obj?: NFTAsset | null) =>
{
    if (obj) asset = obj as NFTAsset;
    else resetAsset();

    setImage(asset.image);
};

let handleMint = () => showToast
(
    getCachedContract(asset.key.nftContract)
    .connect(signer)
    .mint()
    .then( () => setAsset(null) )
);

let handleKey = (event: React.KeyboardEvent<HTMLInputElement>) =>
{
    if (event.key === "Enter") if (asset.image) handleMint();
}

let resetAsset = () =>
{
    asset =
    {
        key :
        {
            nftId       : ""
        ,   nftContract : ""
        } as AssetKey
    ,   name            : ""
    ,   image           : ""
    }
}

let doClean = () => { clearOptionsUICallback(), clearNFTCollectionsEventCallback(); }

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
    let [         , setAssetsChanged ] = useState(0);
    [ image       , setImage ]         = useState(asset.image);
    [ collections , setCollections ]   = useState<NFTAsset[]>(NFTOptCollections);

    assetsChanged = () => setAssetsChanged(f => f ^ 1);

    account = useAccount();
    chainID = useChainID();

    assets = assetsOf(account) ?? [];

    useEffect
    (
        () =>
        {
            setNFTCollectionsLoadCallback(setCollections);
            setNFTCollectionsEventCallback(assetsChanged);

            // Cleanup on unmount
            return () => doClean();
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network) doClean();
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
        <p className="page-title">Mint an NFT from our collections</p>

        <div
            className={classes.root}
            onKeyDown={handleKey}>

            <div className={classes.form}>
                <DropDown_MintForm
                    value={asset}
                    list={collections}
                    onChange={setAsset}
                />

                <List
                    className={classes.list}
                    subheader={<ListSubheader>My assets</ListSubheader>}
                >
                    {
                        assets.map
                        (
                            (item, i) =>
                            <ListItem key={i}>
                                <ListItemAvatar>
                                    <Avatar>
                                        <img src={item.image} alt="NFT image data"/>
                                    </Avatar>
                                </ListItemAvatar>

                                <ListItemText primary={item.name} />
                            </ListItem>
                        )
                    }
                </List>

                <Button
                    className={classes.btnMint}
                    variant="contained"
                    onClick={handleMint}
                    disabled={!asset.image}
                >Mint</Button>
            </div>

            <div className={clsx(classes.imageContainer, !asset.key.nftContract && classes.dummyImageContainer)}>
            {
                asset.key.nftContract
                ?   <img src={image} alt="NFT image data"/>
                :   [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> )
            }
            </div>
        </div>
    </>;
}

export default MintForm;
