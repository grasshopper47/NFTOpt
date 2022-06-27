// @ts-ignore
import classes from "./styles/OptionListItemView.module.scss";
import clsx from "clsx";

import { AccessTime } from "@mui/icons-material";
import { ethers } from "ethers";
import { OptionWithAsset } from "../../models/option";
import { getViewClassName, Views } from "./OptionViewContainer";
import { useOptionChangingIDs } from "../../pages/_app";

type OptionListItemViewProps =
{
    option          : OptionWithAsset
,   viewIndex       : number
,   showDetailsView : (OptionWithAsset: OptionWithAsset | null) => void
};

function OptionListItemView(props: OptionListItemViewProps)
{
    const { option, viewIndex } = props;

    const optionChangingIDs = useOptionChangingIDs();

    const viewCSSClass = classes[ getViewClassName(Views.CARDLIST, viewIndex) ];

    return <>
        <div
            className=
            {
                clsx
                (
                    classes.card
                ,   viewCSSClass
                ,   optionChangingIDs[option.id] && classes.changing
                )
            }
            onClick={ () => props.showDetailsView(option) }
        >
            <img
                style={{ backgroundImage: `url(${option.asset.image})`}}
                className={viewCSSClass}
                alt=""
            />

            <div className={clsx(classes.content, viewCSSClass)}>
                <p className={clsx(classes.title, viewCSSClass)}>
                    #{option.id + 1}
                </p>

                <p className={clsx(classes.title, viewCSSClass)}>
                    {option.asset.name}
                </p>

                <div className={clsx(classes.moreInfoContainer, viewCSSClass)}>
                    <p className={viewCSSClass}>
                        {ethers.utils.formatEther(option.strikePrice)} ETH
                    </p>

                    <p className={viewCSSClass}>
                        <AccessTime className={viewCSSClass} />
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