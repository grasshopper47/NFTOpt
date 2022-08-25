// @ts-ignore
import classes from "../styles/components/RequestForm.module.scss";

import React from "react";
import { OptionFlavor } from "../../models/enums";
import { flavorLabels } from "../utils/labels";
import { FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from "@mui/material";

type Props =
{
    value    : OptionFlavor
,   onChange : (event : SelectChangeEvent<OptionFlavor>) => void
};

const renderValue = (selected) =>
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
            renderValue={renderValue}
            onChange={props.onChange}
        >
            <MenuItem disabled value=""/>
            {
                flavorLabels.map
                (
                    (flavor, i) =>
                    <MenuItem key={i} value={i}>{flavor}</MenuItem>
                )
            }
        </Select>
    </FormControl>;
}
