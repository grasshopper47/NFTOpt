// @ts-ignore
import classes from "../styles/components/OptionListItemView.module.scss";

import { AccessTime } from "@mui/icons-material";
import { ethers } from "ethers";
import { OptionWithAsset } from "../utils/types";
import clsx from "clsx";
import { getViewClass, Views } from "./OptionViewContainer";

type OptionListItemViewProps =
{
    option : OptionWithAsset
,   onViewOptionDetails : (OptionWithAsset: OptionWithAsset | null) => void
,   view : number
};

function getViewClassListItem(view : number)
{
    return classes[getViewClass(Views.CARDLIST, view)];
}

function OptionListItemView(props: OptionListItemViewProps)
{
    const { option, onViewOptionDetails, view } = props;

    return (
        // TODO overlay
        <div
            className={clsx(classes.card, getViewClassListItem(view))}
            onClick={onViewOptionDetails.bind(null, option)}
        >
            <img
                style={{ backgroundImage: `url(${option.asset.image})`}}
                className={getViewClassListItem(view)}
                alt=""
            />

            <div className={clsx(classes.content, getViewClassListItem(view))}>
                <p className={clsx(classes.title, getViewClassListItem(view))}>
                    #{option.id + 1}
                </p>

                <p className={clsx(classes.title, getViewClassListItem(view))}>
                    {option.asset.name}
                </p>

                <div className={clsx(classes.moreInfoContainer, getViewClassListItem(view))}>
                    <p className={getViewClassListItem(view)}>
                        {ethers.utils.formatEther(option.strikePrice)} ETH
                    </p>

                    <p className={getViewClassListItem(view)}>
                        <AccessTime className={getViewClassListItem(view)} />
                        <span>
                            {option.interval} day{option.interval > 1 && "s"}
                        </span>
                    </p>
                </div>

            </div>

        </div>
    );
}

export default OptionListItemView;