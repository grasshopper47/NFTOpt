// @ts-ignore
import classes from "./styles/CardView.module.scss";
import clsx from "clsx";

import React from "react";
import { ethers } from "ethers";
import { OptionWithAsset } from "../../models/option";
import { requestChangingIDs, optionChangingIDs } from "../utils/contexts";
import { ListViewStates } from "../utils/view";
import { AccessTime } from "@mui/icons-material";

type Props =
{
    option        : OptionWithAsset
,   onViewDetails : (o: OptionWithAsset | null) => void
};

let _viewClass : string;

export const setViewClass = (index : number) => _viewClass = classes[ListViewStates[index]];

function CardView(props: Props)
{
    const { option } = props;

    return <div
        className=
        {
            clsx
            (
                classes.card
            ,   _viewClass
            ,   (requestChangingIDs[option.id] || optionChangingIDs[option.id]) && classes.changing
            )
        }
        onClick={ () => props.onViewDetails(option) }
    >
        <img
            style={{ backgroundImage: `url(${option.asset.image})`}}
            className={_viewClass}
            alt=""
        />

         <div className={clsx(classes.content, _viewClass)}>
            <p className={clsx(classes.title, _viewClass)}>
                #{option.id + 1}
            </p>

            <p className={clsx(classes.title, _viewClass)}>
                {option.asset.name}
            </p>

            <div className={clsx(classes.moreInfoContainer, _viewClass)}>
                <p className={_viewClass}>
                    {ethers.utils.formatEther(option.strikePrice)}&nbsp;<b>ETH</b>
                </p>

                <p className={_viewClass}>
                    🗓&nbsp;{option.interval} day{option.interval > 1 && "s"}
                </p>
            </div>
        </div>
    </div>;
}

export default CardView;
