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
    option : OptionWithAsset
,   onViewOptionDetails : (OptionWithAsset: OptionWithAsset | null) => void
,   view : number
};

function getViewCSSClassListItem(view : number)
{
    return classes[getViewCSSClass(Views.CARDLIST, view)];
}

function OptionListItemView(props: OptionListItemViewProps)
{
    const { option, onViewOptionDetails, view } = props;

    const optionIDs = useOptionsWithIDChanging();

    return <>
        <div
            className=
            {
                clsx
                (
                    classes.card
                ,   getViewCSSClassListItem(view)
                ,   optionIDs.filter(o => o === option.id).length !== 0 && classes.changing
                )
            }
            onClick={onViewOptionDetails.bind(null, option)}
        >
            <img
                style={{ backgroundImage: `url(${option.asset.image})`}}
                className={getViewCSSClassListItem(view)}
                alt=""
            />

            <div className={clsx(classes.content, getViewCSSClassListItem(view))}>
                <p className={clsx(classes.title, getViewCSSClassListItem(view))}>
                    #{option.id + 1}
                </p>

                <p className={clsx(classes.title, getViewCSSClassListItem(view))}>
                    {option.asset.name}
                </p>

                <div className={clsx(classes.moreInfoContainer, getViewCSSClassListItem(view))}>
                    <p className={getViewCSSClassListItem(view)}>
                        {ethers.utils.formatEther(option.strikePrice)} ETH
                    </p>

                    <p className={getViewCSSClassListItem(view)}>
                        <AccessTime className={getViewCSSClassListItem(view)} />
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