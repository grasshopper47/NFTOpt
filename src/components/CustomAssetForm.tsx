// @ts-ignore
import classes from "./styles/RequestForm.module.scss";
import clsx from "clsx";

import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { assetsOf, getNFTAsset } from "../../datasources/assets";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { AssetKey, isValid, stringOf } from "../../models/assetKey";
import { useAccount } from "../utils/contexts";

let setContract = (event: React.ChangeEvent<HTMLInputElement>) =>
{
    newAssetKey.nftContract = event.target.value;

    setErrorText("");
    assetKeyChanged();
};

let setID = (event: React.ChangeEvent<HTMLInputElement>) =>
{
    newAssetKey.nftId = event.target.value;

    setErrorText("");
    assetKeyChanged();
};

let handleValidate = () =>
{
    if(!isValid(newAssetKey))
    {
        setErrorText("Invalid address");

        return;
    }

    let contract = getCachedContract(newAssetKey.nftContract);
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

                    _propsPtr.onSuccess();

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

let resetKey = () =>
{
    newAssetKey.nftId =
    newAssetKey.nftContract = "";
}

let account   : string;
let errorText : string;

let newAssetKey = {} as AssetKey;

let assetKeyChanged : () => void;
let setErrorText    : (a : string) => void;

type Props =
{
    onSuccess : () => void
    onCancel  : () => void
}

let _propsPtr : Props;

resetKey();

function CustomAssetForm(props : Props)
{
    _propsPtr = props;

    let [       , setAssetKeyChanged ] = useState(0);
    [ errorText , setErrorText       ] = useState("");

    assetKeyChanged = () => setAssetKeyChanged(f => f ^ 1);

    account = useAccount();

    return <>
        <div className={classes.twoFieldWrapperAddContract}>
            <TextField
                className={clsx(classes.fieldWrapper, classes.field)}
                { ... errorText && { error: true, helperText: errorText } }
                label="NFT Contract Address"
                placeholder={"Enter an address"}
                value={newAssetKey.nftContract}
                onChange={setContract}
            />

            <TextField
                className={clsx(classes.fieldWrapper, classes.field)}
                label="Token ID"
                placeholder={"Enter token ID"}
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
