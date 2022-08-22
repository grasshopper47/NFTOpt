// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";
import { stringOf } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

let selectedAsset : NFTAsset | undefined | null = null;

type Props =
{
    value    : string
,   list    ?: NFTAsset[]
,   onChange : (asset: NFTAsset | undefined) => void
};

export default function(props : Props)
{
    console.log(1);
    return <FormControl className={classes.fieldWrapper}>
        <InputLabel id="select-label">NFT Item</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value}
            labelId="select-label"
            label="NFT Item"
            renderValue={ (value) => { return value === "_" || !selectedAsset ? <em>Select an NFT</em> : selectedAsset.name; } }
            onChange=
            {
                (event) =>
                {
                    if (!props.list) return;

                    selectedAsset = props.list.find(a => stringOf(a.key) === event.target.value);
                    props.onChange(selectedAsset)
                }
            }
        >
            <MenuItem disabled value="_" />
            {
                props.list
                ?   props.list[0]
                    ?   props.list.map ( (asset, i) => <MenuItem key={i} value={stringOf(asset.key)}>{asset.name}</MenuItem> )
                    :   <MenuItem disabled sx={ { justifyContent : "center" , display : "flex" } } >Assets missing</MenuItem>
                :   <MenuItem disabled sx={ { justifyContent : "center" , display : "flex" } } >Loading assets...</MenuItem>
            }
        </Select>
    </FormControl>;
}
