// @ts-ignore
import classes from "../components/styles/DetailsView.module.scss";

import React from "react";
import { Button } from "@mui/material";

type Props =
{
    label       : string
,   variant     : "outlined" | "contained" | "text" | undefined
,   className   : string
,   handleClick : any
};

export default function(props: Props)
{
    return <Button
        variant={props.variant}
        className={classes[props.className]}
        onClick={props.handleClick}
    >{props.label}</Button>;
}
