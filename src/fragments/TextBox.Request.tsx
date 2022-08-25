// @ts-ignore
import classes from "../styles/components/RequestForm.module.scss";

import React from "react";
import { TextField } from "@mui/material";

type Props =
{
    fieldName   : string
,   value       : string
,   errorText  ?: string | undefined
,   onChange   ?: any    | undefined
,   onKeyUp    ?: any    | undefined
};

export default function(props : Props)
{
    let label = "";
    let description = "";
    let inputProps = { endAdornment: "" };

    if (props.fieldName === "premium")
    {
        label = "Premium";
        description = props.fieldName;
        inputProps.endAdornment = "ETH";
    }

    if (props.fieldName === "strikePrice")
    {
        label = "Strike Price";
        description = "strike price";
        inputProps.endAdornment = "ETH";
    }

    if (props.fieldName === "interval")
    {
        label = "Interval";
        description = "expiration interval";
        inputProps["inputProps"] = { min: 1, max: 30 };
        inputProps.endAdornment = "days";
    }

    return <div className={classes.fieldWrapper}>
        <TextField
            { ... props.errorText && { error: true, helperText: props.errorText } }
            id={`${props.fieldName}`}
            label={label}
            InputProps={inputProps}
            placeholder={`Enter the ${description}`}
            type={props.fieldName === "interval" ? "number" : ""}
            className={classes.field}
            value={props.value}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
        />
    </div>;
}
