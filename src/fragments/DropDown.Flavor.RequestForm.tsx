// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";
import { OptionFlavor } from "../../models/option";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

type Props =
{
    value    : OptionFlavor
,   onChange : (event : SelectChangeEvent<OptionFlavor>) => void
};

const handleRenderRequest = (selected) =>
{
    if (selected || selected === 0) return OptionFlavor[selected];

    return <em>Select flavor</em>;
};

export default function DropDown_Flavor_RequestForm(props : Props)
{
    return <FormControl className={classes.fieldWrapper}>
        <InputLabel id="flavor-label">Flavor</InputLabel>

        <Select
            MenuProps={{ classes: { paper: classes.menuPaper } }}
            value={props.value}
            labelId="flavor-label"
            label="Flavor"
            renderValue={handleRenderRequest}
            onChange={props.onChange}
        >
            <MenuItem disabled value="" />
            {
                Object.keys(OptionFlavor).map
                (
                    (k, index) =>
                    k === index.toString() &&
                    <MenuItem key={index} value={index}>{OptionFlavor[index]}</MenuItem>
                )
            }
        </Select>
    </FormControl>;
}
