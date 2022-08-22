// @ts-ignore
import classes from "./styles/MintForm.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { Collection_BASE } from "../../typechain-types";
import { network } from "../../datasources/provider";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { NFTOptCollections } from "../../datasources/ERC-721/NFTOptCollections";
import { assetsOf } from "../../datasources/assets";
import { AssetKey } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { clearNFTCollectionsEventCallback, setNFTCollectionsEventCallback } from "../controllers/NFTOptCollections";
import { useAccount, useChainID, clearNFTCollectionsLoadCallback, setNFTCollectionsLoadCallback, clearAssetsLoadCallback, setAssetsLoadCallback } from "../utils/contexts";
import { showToast } from "../utils/toasting";
import { signer } from "../utils/metamask";
import DropDown_MintForm from "../fragments/DropDown.Collections.MintForm";
import { Avatar, Button, ListItem, ListItemAvatar, ListItemText, ListSubheader } from "@mui/material";
import { List } from '@mui/material';

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
                        assets
                        ?   assets[0]
                            ?   assets.map
                                (
                                    (item, i) =>
                                    <ListItem
                                        key={i}
                                        sx={ { cursor: "pointer" } }
                                        onClick={ () => setImage(item.image) }
                                    >
                                        <ListItemAvatar>
                                            <Avatar>
                                                <img src={item.image} alt="NFT image data"/>
                                            </Avatar>
                                        </ListItemAvatar>

                                        <ListItemText primary={item.name} />
                                    </ListItem>
                                )
                            :   <ListItemText primary={"Assets missing"} sx={ { justifyContent : "center" , display : "flex" } }/>
                        :   <ListItemText primary={"Loading assets..."} sx={ { justifyContent : "center" , display : "flex" } }/>
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
                image
                ?   <img src={image} alt="NFT image data"/>
                :   [0, 0, 0].map( (_, i) => <div key={`dot-${i}`} className={classes.dot} /> )
            }
            </div>
        </div>
    </>;
}

export default MintForm;
