// @ts-ignore
import classes from "./styles/OptionRowView.module.scss";

import { ethers } from "ethers";
import { OptionWithAsset } from "../../models/extended";
import clsx from "clsx";

type OptionRowView =
{
    option        : OptionWithAsset
,   showDetails   ?: boolean
};

function OptionRowView(props: OptionRowView)
{
    return <>
        <div className={classes.container}>
            <p className={classes.field}>{ !props.showDetails && props.option.id + 1}</p>
            <p className={clsx(classes.field, props.showDetails && classes.selected)}>{props.option.asset.name}</p>
            <p className={classes.field}>{ !props.showDetails && ethers.utils.formatEther(props.option.premium)}</p>
            <p className={classes.field}>{ !props.showDetails && ethers.utils.formatEther(props.option.strikePrice)}</p>
            <p className={classes.field}>{ !props.showDetails && props.option.interval}</p>
        </div>
    </>;
}

export default OptionRowView;