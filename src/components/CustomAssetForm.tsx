// @ts-ignore
import classes from "./styles/RequestForm.module.scss";
import clsx from "clsx";

import React, { useState } from "react";
import { useAccount } from "../pages/_app";
import { TextField, Button } from "@mui/material";
import { assetsOf, getNFTAsset } from "../../datasources/assets";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { AssetKey, isValid, stringOf } from "../../models/assetKey";
import { provider } from "../utils/metamask";

let newAssetKey = {} as AssetKey;

const resetKey = () =>
{
    newAssetKey.nftId =
    newAssetKey.nftContract = "";
}

resetKey();

type Props =
{
    onSuccess : () => void
    onCancel  : () => void
}

function CustomAssetForm(props : Props)
{
    const [ , setAssetKeyChanged ]    = useState(0);
    const [ errorText, setErrorText ] = useState("");

    const assetKeyChanged = () => setAssetKeyChanged(f => f ^ 1);

    const account = useAccount();

    const setContract = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setErrorText("");
        newAssetKey.nftContract = event.target.value;
        assetKeyChanged();
    };

    const setID = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        setErrorText("");
        newAssetKey.nftId = event.target.value;
        assetKeyChanged();
    };

    const handleValidate = () =>
    {
        if(!isValid(newAssetKey))
        {
            setErrorText("Invalid address");

            return;
        }

        let contract = getCachedContract(newAssetKey.nftContract, provider());
        contract.ownerOf(newAssetKey.nftId).then
        (
            owner =>
            {
                if (owner !== account)
                {
                    setErrorText("Must own token");

                    return;
                }

                let arr = assetsOf(account) ?? [];

                getNFTAsset(newAssetKey).then
                (
                    asset =>
                    {
                        let assetKey = stringOf(asset.key);

                        for (let a of arr)
                        {
                            if (assetKey === stringOf(a.key))
                            {
                                setErrorText("NFT already known");
                                return;
                            }
                        }

                        arr.push(asset);

                        props.onSuccess();

                        resetKey();
                        setErrorText("");
                    }
                )
            }
        )
        .catch
        (
            error => { if (error.toString().search("query for nonexistent token")) setErrorText("Non-existing token ID"); }
        );
    }

    return <>
        <div className={classes.twoFieldWrapperAddContract}>
            <TextField
                className={clsx(classes.fieldWrapper, classes.field)}
                { ... errorText && { error: true, helperText: errorText } }
                label="NFT Contract Address"
                placeholder={`Enter an address`}
                value={newAssetKey.nftContract}
                onChange={setContract}
            />

            <TextField
                className={clsx(classes.fieldWrapper, classes.field)}
                label="Token ID"
                placeholder={`Enter token ID`}
                value={newAssetKey.nftId}
                onChange={setID}
            />
        </div>

        <Button
            className={classes.btnOK}
            size="small"
            onClick={handleValidate}
        >✔</Button>

        <Button
            className={classes.btnCancel}
            size="small"
            onClick={props.onCancel}
        >❌</Button>
    </>;
}

export default CustomAssetForm;
