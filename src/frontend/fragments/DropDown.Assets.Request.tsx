// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React, { useState } from "react";
import { stringOf } from "../../datasources/NFTAssets";
import { NFTAsset } from "../../models/NFTAsset";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

type Props =
{
    value    : string
,   list     : NFTAsset[]
,   onChange : (asset: NFTAsset | undefined) => void
};

let selectedAsset : NFTAsset | undefined | null = null;

export default function(props: Props)
{
    return <FormControl className={classes.fieldWrapper}>
        <InputLabel id="select-label">NFT Item</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value}
            labelId="select-label"
            label="NFT Item"
            renderValue={(value) => { return value === "_" || !selectedAsset ? <em>Select an NFT</em> : selectedAsset.name; } }
            onChange={ (event) => { selectedAsset = props.list.find(a => stringOf(a.key) === event.target.value); props.onChange(selectedAsset) } }
        >
            <MenuItem disabled value="_" />
            {
                props.list
                ?   props.list.map ( (asset, i) => <MenuItem key={i} value={stringOf(asset.key)}>{asset.name}</MenuItem> )
                :   "Loading items..."
            }
        </Select>
    </FormControl>;
}
