// @ts-ignore
import classes from "../styles/components/OptionListItemView.module.scss";
import clsx from "clsx";

import { AccessTime } from "@mui/icons-material";
import { ethers } from "ethers";
import { OptionWithAsset } from "../utils/types";
import { getViewCSSClass, Views } from "./OptionViewContainer";
import { useOptionsWithIDChanging } from "../pages/_app";

type OptionListItemViewProps =
{
    option          : OptionWithAsset
,   viewIndex       : number
,   showDetailsView : (OptionWithAsset: OptionWithAsset | null) => void
};

function OptionListItemView(props: OptionListItemViewProps)
{
    const { option, viewIndex } = props;

    const optionIDs = useOptionsWithIDChanging();

    const viewCSSClass = classes[getViewCSSClass(Views.CARDLIST, viewIndex)];

    return <>
        <div
            className=
            {
                clsx
                (
                    classes.card
                ,   viewCSSClass
                ,   optionIDs.filter(o => o === option.id).length !== 0 && classes.changing
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