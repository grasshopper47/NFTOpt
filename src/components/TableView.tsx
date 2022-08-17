// @ts-ignore
import classes from "./styles/TableView.module.scss";

import React from 'react';
import { OptionWithAsset } from "../../models/option";
import RowView from "./RowView";

let sortList = (sorter : (a1: OptionWithAsset, a2: OptionWithAsset) => number) =>
{
    if (sortMode === SortMode.ASCENDING) { _propsPtr.list.sort(sorter); sortMode = SortMode.DESCENDING; }
    else                                 { _propsPtr.list.sort((a, b) => sorter(b, a)); sortMode = SortMode.ASCENDING; }

    _propsPtr.onSort(_propsPtr.list);
}

let createHeader = () =>
{
    return <div className={classes.listRowsHeader}>
        <p onClick={ () => sortList( (a, b) => b.id - a.id ) }
        >#</p>

        <p onClick={ () => sortList( (a, b) => b.asset.name.localeCompare(a.asset.name) ) }
        >Name</p>

        <p onClick={ () => sortList( (a, b) => parseFloat(b.premium.sub(a.premium).toString()) ) }
        >Premium</p>

        <p onClick={ () => sortList( (a, b) => parseFloat(b.strikePrice.sub(a.strikePrice).toString()) ) }
        >Strike Price</p>

        <p onClick={ () => sortList( (a, b) => b.interval - a.interval ) }
        >Interval</p>
    </div>
}

enum SortMode { ASCENDING, DESCENDING };
let sortMode = SortMode.ASCENDING;

type Props =
{
    list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset | null | undefined
,   onSelect       : (obj: OptionWithAsset | null) => void
,   onSort         : (list: OptionWithAsset[]) => void
};

let _propsPtr : Props;

function TableView(props : Props)
{
    let length = props.list ? props.list.length : 0;
    if (length === 0) return <></>;

    _propsPtr = props;

    let selectedID = props.selectedValue ? props.selectedValue.id : -1;

    return  <div className={classes.containerGrid}>
        { createHeader() }
        {
            props.list.map
            (
                (option, index) =>
                <RowView
                    key={`option-row-${index}`}
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
