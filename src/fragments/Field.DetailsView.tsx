// @ts-ignore
import classes from "../components/styles/DetailsView.module.scss";

import React from "react";
import { scanner } from "../../datasources/provider";
import { getAccountDisplayValue } from "../utils/helpers";

type Props =
{
    label : string
,   value : string
,   className? : string
,   isLink ?: boolean
};

export default function(props : Props)
{
    const showLink = props.isLink ?? false;

    return <div className={classes.field}>
        <span>{props.label}</span>

        <span { ... props.className && { className: classes[props.className] } }>
        {
            showLink
            ?   <a  target="_blank"
                    href={`${scanner}/address/${props.value}`}
                    className={classes.link}
                >{ getAccountDisplayValue(props.value) }</a>

            :   props.value
        }
        </span>
    </div>;
}
