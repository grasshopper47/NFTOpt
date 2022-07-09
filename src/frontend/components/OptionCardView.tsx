// @ts-ignore
import classes from "./styles/OptionCardView.module.scss";
import clsx from "clsx";

import React from 'react';
import { ethers } from "ethers";
import { useRequests, useOptions } from "../../pages/_app";
import { OptionWithAsset } from "../../models/extended";
import { getViewClassName, Views } from "./OptionViewContainer";
import { AccessTime } from "@mui/icons-material";

type Props =
{
    option          : OptionWithAsset
,   viewIndex       : number
,   showDetailsView : (OptionWithAsset: OptionWithAsset | null) => void
};

function OptionCardView(props: Props)
{
    const { option, viewIndex } = props;

    const requests = useRequests();
    const options  = useOptions();

    const className = classes[ getViewClassName(Views.CARDLIST, viewIndex) ];

    return <>
        <div
            className=
            {
                clsx
                (
                    classes.card
                ,   className
                ,   (requests.changing[option.id] || options.changing[option.id]) && classes.changing
                )
            }
            onClick={ () => props.showDetailsView(option) }
        >
            <img
                style={{ backgroundImage: `url(${option.asset.image})`}}
                className={className}
                alt=""
            />

            <div className={clsx(classes.content, className)}>
                <p className={clsx(classes.title, className)}>
                    #{option.id + 1}
                </p>

                <p className={clsx(classes.title, className)}>
                    {option.asset.name}
                </p>

                <div className={clsx(classes.moreInfoContainer, className)}>
                    <p className={className}>
                        {ethers.utils.formatEther(option.strikePrice)} ETH
                    </p>

                    <p className={className}>
                        <AccessTime className={className} />
                        <span>
                            {option.interval} day{option.interval > 1 && "s"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </>;
}

export default OptionCardView;
