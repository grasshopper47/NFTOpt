// @ts-ignore
import classes from "./styles/CardView.module.scss";
import clsx from "clsx";

import React from "react";
import { ethers } from "ethers";
import { OptionWithAsset } from "../../models/option";
import { requestChangingIDs, optionChangingIDs } from "../utils/contexts";
import { ListViewStates } from "../utils/view";

export let setViewClass = (index : number) => viewClass = classes[ListViewStates[index]];

let viewClass : string;

type Props =
{
    option        : OptionWithAsset
,   onViewDetails : (o: OptionWithAsset | null) => void
};

function CardView(props : Props)
{
    return <div
        className=
        {
            clsx
            (
                classes.card
            ,   viewClass
            ,   (requestChangingIDs[props.option.id] || optionChangingIDs[props.option.id]) && classes.changing
            )
        }
        onClick={ () => props.onViewDetails(props.option) }
    >
        <img
            style={{ backgroundImage: `url(${props.option.asset.image})`}}
            className={viewClass}
            alt=""
        />

         <div className={clsx(classes.content, viewClass)}>
            <p className={clsx(classes.title, viewClass)}>
                #{props.option.id + 1}
            </p>

            <p className={clsx(classes.title, viewClass)}>
                {props.option.asset.name}
            </p>

            <div className={clsx(classes.moreInfoContainer, viewClass)}>
                <p className={viewClass}>
                    {ethers.utils.formatEther(props.option.strikePrice)}&nbsp;<b>ETH</b>
                </p>

                <p className={viewClass}>
                    🗓&nbsp;{props.option.interval} day{props.option.interval > 1 && "s"}
                </p>
            </div>
        </div>
    </div>;
}

export default CardView;
