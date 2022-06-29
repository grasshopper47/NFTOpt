// @ts-ignore
import classes from "./styles/OptionListItemView.module.scss";
import clsx from "clsx";

import { AccessTime } from "@mui/icons-material";
import { ethers } from "ethers";
import { OptionWithAsset } from "../../models/extended";
import { getViewClassName, Views } from "./OptionViewContainer";
import { useOptionChangingIDs, useRequestChangingIDs } from "../../pages/_app";

type OptionListItemViewProps =
{
    option          : OptionWithAsset
,   viewIndex       : number
,   showDetailsView : (OptionWithAsset: OptionWithAsset | null) => void
};

function OptionListItemView(props: OptionListItemViewProps)
{
    const { option, viewIndex } = props;

    const requestChangingIDs = useRequestChangingIDs();
    const optionChangingIDs = useOptionChangingIDs();

    const className = classes[ getViewClassName(Views.CARDLIST, viewIndex) ];

    return <>
        <div
            className=
            {
                clsx
                (
                    classes.card
                ,   className
                ,   (requestChangingIDs[option.id] || optionChangingIDs[option.id]) && classes.changing
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

export default OptionListItemView;