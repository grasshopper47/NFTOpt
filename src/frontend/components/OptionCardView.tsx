// @ts-ignore
import classes from "./styles/OptionCardView.module.scss";
import clsx from "clsx";

import React from 'react';
import { ethers } from "ethers";
import { useRequests, useOptions } from "../../pages/_app";
import { OptionWithAsset } from "../../models/extended";
import { AccessTime } from "@mui/icons-material";
import { CardViewStates } from "./OptionListView";

type Props =
{
    option        : OptionWithAsset
,   onViewDetails : (o: OptionWithAsset | null) => void
,   viewIndex     : number
};

function OptionCardView(props: Props)
{
    const { option, viewIndex } = props;

    const requests = useRequests();
    const options  = useOptions();

    const viewClass = classes[CardViewStates[viewIndex]];

    return <div
        className=
        {
            clsx
            (
                classes.card
            ,   viewClass
            ,   (requests.changing[option.id] || options.changing[option.id]) && classes.changing
            )
        }
        onClick={ () => props.onViewDetails(option) }
    >
        <img
            style={{ backgroundImage: `url(${option.asset.image})`}}
            className={viewClass}
            alt=""
        />

        <div className={clsx(classes.content, viewClass)}>
            <p className={clsx(classes.title, viewClass)}>
                #{option.id + 1}
            </p>

            <p className={clsx(classes.title, viewClass)}>
                {option.asset.name}
            </p>

            <div className={clsx(classes.moreInfoContainer, viewClass)}>
                <p className={viewClass}>
                    {ethers.utils.formatEther(option.strikePrice)} ETH
                </p>

                <p className={viewClass}>
                    <AccessTime className={viewClass} />
                    <span>
                        {option.interval} day{option.interval > 1 && "s"}
                    </span>
                </p>
            </div>
        </div>
    </div>;
}

export default OptionCardView;
