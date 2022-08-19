// @ts-ignore
import classes from "./styles/RowView.module.scss";
import clsx from "clsx";

import React from "react";
import { ethers } from "ethers";
import { OptionWithAsset } from "../../models/option";
import { requestChangingIDs, optionChangingIDs } from "../utils/contexts";
import DetailsView from "./DetailsView";

type RowView =
{
    option       : OptionWithAsset
,   showDetails ?: boolean
,   onClick     ?: () => void
};

function RowView(props: RowView)
{
    return <>
        <div className={classes.container} { ... props.onClick && { onClick : props.onClick } }>
            <p className={classes.field}>{ !props.showDetails && (props.option.id + 1)}</p>
            <p
                className=
                {
                    clsx
                    (
                        classes.field
                    ,   (requestChangingIDs[props.option.id] || optionChangingIDs[props.option.id]) && classes.changing
                    ,   props.showDetails && classes.selected
                    )
                }
            >{props.option.asset.name}</p>
            <p className={classes.field}>{ !props.showDetails && ethers.utils.formatEther(props.option.premium).slice(0, 10)}</p>
            <p className={classes.field}>{ !props.showDetails && ethers.utils.formatEther(props.option.strikePrice).slice(0, 10)}</p>
            <p className={classes.field}>{ !props.showDetails && props.option.interval}</p>
        </div>
        {
            props.showDetails &&
            <div className={classes.detailWrapper}>
                <DetailsView showTitle={false} option={props.option} onAction={props.onClick} />
            </div>
        }
    </>;
}

export default RowView;
