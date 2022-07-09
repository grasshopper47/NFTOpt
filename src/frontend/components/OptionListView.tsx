// @ts-ignore
import classes from "./styles/OptionListView.module.scss";
import clsx from "clsx";

import React from 'react';
import { OptionWithAsset } from "../../models/extended";
import OptionCardView from "./OptionCardView";
import OptionDetailsView from './OptionDetailsView';
import { IconButton } from "@mui/material";
import { ArrowBackIosRounded } from "@mui/icons-material";

type Props =
{
    list           : OptionWithAsset[]
,   onSelect       : (obj: OptionWithAsset | null) => void
,   selectedValue ?: OptionWithAsset
,   viewIndex     ?: number
}

export const CardViewStates = [ "S", "M", "L" ];

function OptionListView(props: Props)
{
    if (!props.selectedValue)
        return <div className={clsx(classes.containerGrid, classes[CardViewStates[props.viewIndex ?? 0]])}>
            {
                props.list.map
                (
                    option =>
                    <OptionCardView
                        key={`option-card-${option.id}`}
                        option={option}
                        viewIndex={props.viewIndex ?? 0}
                        { ... props.onSelect && {onViewDetails: props.onSelect}}
                    />
                )
            }
        </div>;

    return <div className={classes.detailsWrapper}>
        <IconButton
            className={classes.goBackBtn}
            onClick={() => props.onSelect(null)}
        >
            <ArrowBackIosRounded />
        </IconButton>

        <OptionDetailsView
            option={props.selectedValue}
            onAction={() => props.onSelect(null)} />
    </div>;
}

export default OptionListView;
