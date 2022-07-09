import React from 'react';
import { OptionWithAsset } from "../../models/extended";
import OptionCardView from "./OptionCardView";

type Props =
{
    list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset
,   onSelect      ?: (obj: OptionWithAsset | null) => void
,   viewIndex     ?: number
}

function OptionListView(props: Props)
{
    return <>
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
    </>
}

export default OptionListView;
