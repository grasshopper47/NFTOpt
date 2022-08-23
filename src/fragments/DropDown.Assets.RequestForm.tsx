// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";

import { stringOf } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { menuItemInfo } from "../utils/loading";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const renderValue = () => name ? name : <em>Select an NFT</em>;

let name : string | undefined;

type Props =
{
    value   ?: string
,   list    ?: NFTAsset[]
,   onChange : (asset ?: NFTAsset) => void
};

export default function(props : Props)
{
    name = props.value ? name : undefined;

    return <FormControl className={classes.fieldWrapper}>
        <InputLabel id="select-label">NFT Item</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value ?? "_"}
            labelId="select-label"
            label="NFT Item"
            renderValue={renderValue}
        >
            <MenuItem disabled value="_" />
            {
                props.list
                ?   props.list[0]
                    ?   props.list.map
                        (
                            (asset, i) =>
                            <MenuItem
                                key={i}
                                value={stringOf(asset.key)}
                                onClick={ () => { name = asset.name; props.onChange(asset); } }
                            >{asset.name}</MenuItem>
                        )
                    :   menuItemInfo("Assets missing")
                :   menuItemInfo("Loading assets...")
            }
        </Select>
    </FormControl>;
}
