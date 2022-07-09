// @ts-ignore
import classes from "./styles/TableView.module.scss";

import React, { useState } from 'react';
import { OptionWithAsset } from "../../models/extended";
import RowView from "./RowView";

enum SortMode { ASCENDING, DESCENDING };
let sortMode = SortMode.DESCENDING;

type Props =
{
    list           : OptionWithAsset[]
,   onSelect       : (obj: OptionWithAsset | null) => void
,   selectedValue ?: OptionWithAsset
,   viewIndex     ?: number
};

export const TableViewStates = [ "25", "50", "100" ];

let sortList : (sorter : (a1: OptionWithAsset, a2: OptionWithAsset) => number) => void;

let header =
(
    <div className={classes.listRowsHeader}>
        <p onClick={ () => sortList( (a, b) => b.id - a.id ) }
        >#</p>

        <p onClick={ () => sortList( (a, b) => b.asset.name.localeCompare(a.asset.name) ) }
        >Name</p>

        <p onClick={ () => sortList( (a, b) => b.premium.toString().localeCompare(a.premium.toString()) ) }
        >Premium</p>

        <p onClick={ () => sortList( (a, b) => b.strikePrice.toString().localeCompare(a.strikePrice.toString()) ) }
        >Strike Price</p>

        <p onClick={ () => sortList( (a, b) => b.interval - a.interval ) }
        >Interval</p>
    </div>
);

function TableView(props: Props)
{
    // Used to sort the options in place
    const [ listHash , setListHash ] = useState(0);

    let selectedValueID = props.selectedValue ? props.selectedValue.id : -1;

    sortList = (sorter : (a1: OptionWithAsset, a2: OptionWithAsset) => number) =>
    {
        if (sortMode === SortMode.ASCENDING) { props.list.sort(sorter); sortMode = SortMode.DESCENDING; }
        else                                 { props.list.sort((a, b) => sorter(b, a)); sortMode = SortMode.ASCENDING; }

        setListHash( h => ++h );
    }

    return <div className={classes.containerGrid}>
        { props.list.length !== 0 && header }

        {
            props.list.map
            (
                option =>
                <div
                    key={`option-row-${option.id}`}
                    style={{width:"100%", display:"grid"}}
                    // If previously selected an option, and it is the same one, set it to null
                    onClick={ () => props.onSelect(option.id === selectedValueID ? null : option) }
                >
                    <RowView option={option} showDetails={option.id === selectedValueID} />
                </div>
            )
        }
    </div>;
}

export default TableView;
