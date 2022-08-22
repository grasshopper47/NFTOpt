// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";

import { NFTAsset } from "../../models/NFTAsset";
import { menuItemInfo } from "../utils/loading";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";

type Props =
{
    value    : NFTAsset
,   list    ?: NFTAsset[]
,   onChange : (asset: NFTAsset | undefined | null) => void
};

export default function(props : Props)
{
    return <FormControl className={classes.fieldWrapper}>
        <InputLabel id="select-label">Collection</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value.key.nftContract === "" ? "_" : props.value.key.nftContract}
            labelId="select-label"
            label="Collection"
            renderValue={ () => props.value.name.length ? props.value.name : <em>Select a collection</em> }
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
                                value={item.key.nftContract}
                                onClick={ () => props.onChange(item) }
                            >{item.name}</MenuItem>
                        )
                    :   menuItemInfo("Collections missing")
                :   menuItemInfo("Loading collections...")
            }
        </Select>
    </FormControl>;
}
