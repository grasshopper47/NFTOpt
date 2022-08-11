// @ts-ignore
import classes from "./styles/MintForm.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { showToast } from "../utils/toasting";
import DropDown_MintForm from "../fragments/DropDown.Collections.MintForm";
import { Avatar, Button, ListItem, ListItemAvatar, ListItemText, ListSubheader } from "@mui/material";
import { List } from '@mui/material';
import { AssetKey } from "../../models/assetKey";
import { NFTAsset } from "../../models/nftAsset";
import { network, provider, signer } from "../utils/metamask";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { useAccount, useChainID } from "../pages/_app";
import { assetsOf, loadAssetsFor } from "../../datasources/assets";
import { attachNFTOptCollectionHandlersToInstance, setAssetsUICallback } from "../controllers/NFTOptCollections";
import { createNFTOptCollectionInstances, loadNFTOptCollectionsItems } from "../../datasources/ERC-721/NFTOptCollections";
import { contracts } from "../../datasources/NFTOpt";

let asset = {} as NFTAsset;

const resetAsset = () =>
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

resetAsset();

let _setImageCallback : (img : string) => void;

const setAsset = (obj? : NFTAsset | null) =>
{
    if (obj) asset = obj; else resetAsset();

    _setImageCallback(asset.image);
};

const handleMint = () => showToast
(
    getCachedContract(asset.key.nftContract)
    .connect(signer())
    .mint()
    .then( () => setAsset(null) )
);

const handleKey = (event: React.KeyboardEvent<HTMLInputElement>) =>
{
    if (event.key === "Enter") if (asset.image) handleMint();
}

function MintForm()
{
    const [             , setAssetsChanged ] = useState(0);
    const [ image       , setImage ]         = useState(asset.image);
    const [ collections , setCollections ]   = useState<NFTAsset[]>([]);

    const assetsChanged = () => setAssetsChanged(f => f ^ 1);
    setAssetsUICallback(assetsChanged);

    _setImageCallback = setImage;

    const account = useAccount();
    const chainID = useChainID();
    const assets  = assetsOf(account) ?? [];

    useEffect
    (
        () =>
        {
            let network_  = network();
            if (!network_) return;

            // Initialize
            createNFTOptCollectionInstances(provider(), network_);

            // Load data
            loadNFTOptCollectionsItems(network_).then(setCollections);

            // Subscribe to events
            attachNFTOptCollectionHandlersToInstance(contracts.Collections);
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (!network()) return;

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
                <Button
                    className={classes.btnMint}
                    variant="outlined"
                    onClick={ () =>
                    {
                        fetch(
                            "http://127.0.0.1:8000/subgraphs/name/NFTOpt"
                        ,   {
                                method: "POST"
                            ,   headers: { "Content-Type": "application/json" }
                            ,   body : JSON.stringify(
                            {
                                query: `query
                                {
                                    erc721Transfers
                                    {
                                      token
                                      {
                                        contract { name address:id }
                                        identifier
                                      }
                                      from { address:id }
                                      to   { address:id }
                                    }
                                }`
                            })
                        })
                        .then(res => res.json())
                        .then( (data) =>
                        {
                            console.log(data);
                        })
                    }}
                >Fetch</Button>
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
