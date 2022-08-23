// @ts-ignore
import classes from "./styles/RequestForm.module.scss";
import clsx from "clsx";

import React, { useState } from "react";
import { TextField, Button } from "@mui/material";
import { assetsOf, getAsset } from "../../datasources/assets";
import { getCachedContract } from "../../datasources/ERC-721/contracts";
import { AssetKey, isValid, stringOf } from "../../models/assetKey";
import { useAccount } from "../utils/contexts";

const setContract = (event: React.ChangeEvent<HTMLInputElement>) =>
{
    newAssetKey.nftContract = event.target.value;

    setErrorText("");
    assetKeyChanged();
};

const setID = (event: React.ChangeEvent<HTMLInputElement>) =>
{
    newAssetKey.nftId = event.target.value;

    setErrorText("");
    assetKeyChanged();
};

const handleValidate = () =>
{
    if(!isValid(newAssetKey))
    {
        setErrorText("Invalid address and token ID combination");

        return;
    }

    const contract = getCachedContract(newAssetKey.nftContract);
    contract.ownerOf(newAssetKey.nftId).then
    (
        owner =>
        {
            if (owner !== account)
            {
                setErrorText("Must own token");

                return;
            }

            const arr = assetsOf(account);

            for (const a of arr)
            {
                const isKnown =
                a.key.nftId === newAssetKey.nftId
                &&  a.key.nftContract === newAssetKey.nftContract;

                if (isKnown)
                {
                    setErrorText("NFT already known");

                    return;
                }
            }

            getAsset(newAssetKey).then
            (
                asset =>
                {
                    arr.push(asset);

                    _propsPtr.onSuccess();

                    resetKey();
                    setErrorText("");
                }
            );
        }
    )
    .catch
    (
        error => { if (error.toString().search("query for nonexistent token")) setErrorText("Non-existing token ID"); }
    );
}

const resetKey = () =>
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
