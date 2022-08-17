// @ts-ignore
import classes from "./styles/ListView.module.scss";
import clsx from "clsx";

import React from 'react';
import { OptionWithAsset } from "../../models/option";
import { ListViewStates } from "../utils/view";
import CardView, { setViewClass } from "./CardView";
import DetailsView from './DetailsView';
import { Button } from "@mui/material";

type Props =
{
    list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset
,   viewIndex     ?: number
,   onSelect       : (obj: OptionWithAsset | null) => void
}

function ListView(props : Props)
{
    if (props.selectedValue)
    {
        // Render details view
        return <div className={classes.detailsWrapper}>
            <Button
                className={classes.goBackBtn}
                onClick={ () => props.onSelect(null) }
            >&lt;</Button>

            <DetailsView
                option={props.selectedValue}
                onAction={ () => props.onSelect(null) } />
        </div>;
    }

    let viewIndex = props.viewIndex ?? 0;
    setViewClass(viewIndex);

    // Render list of items
    return <div className={clsx(classes.containerGrid, classes[ListViewStates[viewIndex]])}>
        {
            props.list.map
            (
                option =>
                <CardView
                    key={`option-card-${option.id}`}
                    option={option}
                    { ... props.onSelect && {onViewDetails: props.onSelect}}
                />
            )
        }
    </div>;
}

export default ListView;
