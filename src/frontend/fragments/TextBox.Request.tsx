// @ts-ignore
import classes from "../components/styles/RequestForm.module.scss";

import React from "react";
import { TextField } from "@mui/material";

type Props =
{
    fieldName   : string
,   value       : string
,   onChange   ?: any
,   onKeyUp    ?: any
};

export default function(props: Props)
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
        <label>{label}</label>

        <TextField
            id={`${props.fieldName}`}
            InputProps={inputProps}
            placeholder={`Enter the ${description}`}
            type={props.fieldName === "interval" ? "number" : ""}
            className={classes.field}
            value={props.value}
            onChange={props.onChange}
            onKeyUp={props.onKeyUp}
            size="small"
        />
    </div>;
}
