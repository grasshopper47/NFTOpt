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
,   selectedValue ?: OptionWithAsset | null | undefined
,   viewIndex     ?: number
,   onSelect       : (obj: OptionWithAsset | null) => void
,   onSorted       : (list: OptionWithAsset[]) => void
};

export const TableViewLimits = [ 10, 20, 50 ];

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
    const selectedID = props.selectedValue ? props.selectedValue.id : -1;
    const length = props.list.length;

    sortList = (sorter : (a1: OptionWithAsset, a2: OptionWithAsset) => number) =>
    {
        if (sortMode === SortMode.ASCENDING) { props.list.sort(sorter); sortMode = SortMode.DESCENDING; }
        else                                 { props.list.sort((a, b) => sorter(b, a)); sortMode = SortMode.ASCENDING; }

        props.onSorted(props.list);
    }

    return <div className={classes.containerGrid}>
        { length !== 0 && header }

        {
            props.list.map
            (
                option =>
                <RowView
                    key={`option-row-${length + option.id}`}
                    option={option}
                    showDetails={option.id === selectedID}
                    // If previously selected an option, and it is the same one, set it to null
                    onClick={ () => props.onSelect(option.id === selectedID ? null : option) }
                />
            )
        }
    </div>;
}

export default TableView;
