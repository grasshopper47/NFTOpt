// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";

import { NFTAsset } from "../../models/NFTAsset";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

type Props =
{
    value    : string
,   list     : NFTAsset[]
,   onChange : (asset: NFTAsset | undefined | null) => void
};

let selectedAsset : NFTAsset | undefined | null = null;

export default function(props: Props)
{
    return <FormControl className={classes.fieldWrapper}>
        <InputLabel id="select-label">NFT Collection</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value}
            labelId="select-label"
            label="NFT Collection"
            renderValue={ (value) => { return value === "_" || !selectedAsset ? <em>Select a collection</em> : selectedAsset.name; } }
            onChange={ (event) => { selectedAsset = props.list.find(c => c.key.nftContract === event.target.value); props.onChange(selectedAsset) } }
        >
            <MenuItem disabled value="_" />
            {
                props.list &&
                props.list.map
                (
                    (item, i) =>
                    <MenuItem key={i} value={item.key.nftContract}>{item.name}</MenuItem>
                )
            }
        </Select>
    </FormControl>;
}
