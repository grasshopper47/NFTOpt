// @ts-ignore
import classes from "../styles/components/FilterBox.module.scss";

import React, { useState } from "react";
import { TextField } from "@mui/material";

type Props =
{
    label      : string
,   value      : { min : string, max: string }
,   onFilter   : () => void
,   onValidate : (value : string) => string
};

export default function(props : Props)
{
    const [ showPlaceholders, setPlaceholders] = useState(false);
    const show = () => setPlaceholders(true);
    const hide = () => setPlaceholders(false);

    const onChangeMin = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        props.value.min = props.onValidate(event.target.value);
        props.onFilter();
    };

    const onChangeMax = (event: React.ChangeEvent<HTMLInputElement>) =>
    {
        props.value.max = props.onValidate(event.target.value);
        props.onFilter();
    };

    let endAdornment = "ETH";

    if (props.label === "Interval") endAdornment = "days";

    return <div className={classes.wrapperMain}>
        <label className={classes.label}>{props.label}:</label>

        <div
            className={classes.wrapperTextBox}
            onBlur={hide}
            onFocus={show}
            onMouseLeave={hide}
            onMouseEnter={show}
        >
            <TextField
                { ... showPlaceholders && { label : "min" } }
                value={props.value.min}
                onChange={onChangeMin}
                color="secondary"
                className={classes.textBox}
                size="small"
                autoComplete="off"
            />

            <TextField
                { ... showPlaceholders && { label : "max" } }
                value={props.value.max}
                onChange={onChangeMax}
                color="primary"
                className={classes.textBox}
                size="small"
                autoComplete="off"
            />
        </div>

        <label className={classes.endAdornment}>{endAdornment}</label>
    </div>;
}
