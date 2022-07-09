// @ts-ignore
import classes from "./styles/OptionTableView.module.scss";

import React, { useState } from 'react';
import { OptionWithAsset } from "../../models/extended";
import OptionRowView from "./OptionRowView";

enum SortMode { ASCENDING, DESCENDING };
let sortMode = SortMode.DESCENDING;

let updateViewedOptionsHash : () => void;

type Props =
{
    list   : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset
,   onSelect ?: (obj: OptionWithAsset | null) => void
};

function OptionTableView(props: Props)
{
    const [ listHash , setViewedOptionsHash ] = useState(0);

    // For sorting the viewed options in-place (ROWLIST view)
    updateViewedOptionsHash = () => setViewedOptionsHash( h => ++h );

    let selectedValueID = props.selectedValue ? props.selectedValue.id : -1;

    let sortViewedOptions = (sorter : (a1: OptionWithAsset, a2: OptionWithAsset) => number) =>
    {
        if (sortMode === SortMode.ASCENDING) { props.list.sort(sorter); sortMode = SortMode.DESCENDING; }
        else                                 { props.list.sort((a, b) => sorter(b, a)); sortMode = SortMode.ASCENDING; }

        updateViewedOptionsHash();
    }

    return <>
        {
            props.list.length !== 0 &&
            <div className={classes.listRowsHeader}>
                <p onClick={ () => sortViewedOptions( (a, b) => b.id - a.id ) }
                >#</p>

                <p onClick={ () => sortViewedOptions( (a, b) => b.asset.name.localeCompare(a.asset.name) ) }
                >Name</p>

                <p onClick={ () => sortViewedOptions( (a, b) => b.premium.toString().localeCompare(a.premium.toString()) ) }
                >Premium</p>

                <p onClick={ () => sortViewedOptions( (a, b) => b.strikePrice.toString().localeCompare(a.strikePrice.toString()) ) }
                >Strike Price</p>

                <p onClick={ () => sortViewedOptions( (a, b) => b.interval - a.interval ) }
                >Interval</p>
            </div>
        }

        {
            props.list.map
            (
                option =>
                <div
                    key={`option-row-${option.id}`}
                    style={{width:"100%", display:"grid"}}
                    // If previously selected an option, and it is the same one, set it to null
                    { ... props.onSelect && { onClick: () => props.onSelect(option.id === selectedValueID ? null : option) } }
                >
                    <OptionRowView option={option} showDetails={option.id === selectedValueID} />
                </div>
            )
        }
    </>;
}

export default OptionTableView;
