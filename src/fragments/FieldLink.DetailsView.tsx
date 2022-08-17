// @ts-ignore
import classes from "../components/styles/DetailsView.module.scss";

import React from "react";
import { getAccountDisplayValue } from "../utils/helpers";
import { scanner } from "../../datasources/provider";

type Props =
{
    label : string
,   value : string
};

export default function(props : Props)
{
    return <div className={classes.field}>
        <span>{props.label}</span>

        <a  target="_blank"
            href={`${scanner}/address/${props.value}`}
            className={classes.link}
        >{ getAccountDisplayValue(props.value) }</a>
    </div>;
}
