import React from "react";
import { OptionFlavor } from "../../models/option";
import { flavorLabels } from "../utils/labels";
import { FormControlLabel, Radio } from "@mui/material";

type Props =
{
    flavor    : OptionFlavor
,   value     : number
,   onChange ?: any
,   onKeyUp    ?: any
};

export default function(props: Props)
{
    let name = flavorLabels[props.flavor];

    return <FormControlLabel
        key={`radio-${name}`}
        label={name}
        value={props.flavor}
        control={<Radio checked={props.flavor === props.value} />}
        onChange={props.onChange}
        onKeyUp={props.onKeyUp}
    />;
}
