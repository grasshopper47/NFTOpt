// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";

import { stringOf } from "../../models/assetKey";
import { NFTAsset } from "../../models/NFTAsset";
import { menuItemInfo } from "../utils/loading";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

const renderValue = () => name ? name : <em>Select a collection</em>;

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
        <InputLabel id="select-label">Collection</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value ?? "_"}
            labelId="select-label"
            label="Collection"
            renderValue={renderValue}
        >
            <MenuItem disabled value="_" />
            {
                props.list
                ?   props.list[0]
                    ?   props.list.map
                        (
                            (item, i) =>
                            <MenuItem
                                key={i}
                                value={stringOf(item.key)}
                                onClick={ () => { name = item.name; props.onChange(item); } }
                            >{item.name}</MenuItem>
                        )
                    :   menuItemInfo("Collections missing")
                :   menuItemInfo("Loading collections...")
            }
        </Select>
    </FormControl>;
}
