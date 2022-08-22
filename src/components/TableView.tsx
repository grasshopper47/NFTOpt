// @ts-ignore
import classes from "./styles/TableView.module.scss";

import React from 'react';
import { OptionWithAsset } from "../../models/option";
import RowView from "./RowView";

const sortList = (sorter : (a: OptionWithAsset, b: OptionWithAsset) => number) =>
{
    sortMode === SortMode.ASCENDING
    ?   _propsPtr.onSort(sorter)
    :   _propsPtr.onSort((a, b) => sorter(b, a));

    sortMode ^= 1; // Flip between ASC and DESC
}

const sortByID          = () =>  sortList( (a, b) => b.id - a.id );
const sortByName        = () =>  sortList( (a, b) => b.asset.name.localeCompare(a.asset.name) );
const sortByPremium     = () =>  sortList( (a, b) => parseFloat(b.premium.sub(a.premium).toString()) );
const sortByStrikePrice = () =>  sortList( (a, b) => parseFloat(b.strikePrice.sub(a.strikePrice).toString()) );
const sortByInterval    = () =>  sortList( (a, b) => b.interval - a.interval );

const createHeader = () =>
{
    return <div className={classes.listRowsHeader}>
        <p onClick={sortByID}>#</p>
        <p onClick={sortByName}>Name</p>
        <p onClick={sortByPremium}>Premium</p>
        <p onClick={sortByStrikePrice}>Strike Price</p>
        <p onClick={sortByInterval}>Interval</p>
    </div>
}

enum SortMode { ASCENDING, DESCENDING };
let sortMode = SortMode.ASCENDING;

type Props =
{
    list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset | null | undefined
,   onSelect       : (obj: OptionWithAsset | null) => void
,   onSort         : (sorter : (a: OptionWithAsset, b: OptionWithAsset) => number) => void
};

let _propsPtr : Props;

function TableView(props : Props)
{
    const length = props.list ? props.list.length : 0;
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
