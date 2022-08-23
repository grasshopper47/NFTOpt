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

enum SortMode { ASCENDING, DESCENDING };
let sortMode = SortMode.ASCENDING;

const sortByID          = () =>  sortList( (a, b) => b.id - a.id );
const sortByName        = () =>  sortList( (a, b) => b.asset.name.localeCompare(a.asset.name) );
const sortByPremium     = () =>  sortList( (a, b) => parseFloat(b.premium.sub(a.premium).toString()) );
const sortByStrikePrice = () =>  sortList( (a, b) => parseFloat(b.strikePrice.sub(a.strikePrice).toString()) );
const sortByInterval    = () =>  sortList( (a, b) => b.interval - a.interval );

const header =
<div className={classes.listRowsHeader}>
    <p onClick={sortByID}>#</p>
    <p onClick={sortByName}>Name</p>
    <p onClick={sortByPremium}>Premium</p>
    <p onClick={sortByStrikePrice}>Strike Price</p>
    <p onClick={sortByInterval}>Interval</p>
</div>;

type Props =
{
    list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset | null | undefined
,   onSelect       : (option: OptionWithAsset | null) => void
,   onSort         : (sorter : (a: OptionWithAsset, b: OptionWithAsset) => number) => void
};

let _propsPtr : Props;

function TableView(props : Props)
{
    if (props.list.length === 0) return <></>;

    _propsPtr = props;

    const selectedID = props.selectedValue ? props.selectedValue.id : -1;

    return  <div className={classes.containerGrid}>
        { header }
        {
            props.list.map
            (
                option =>
                <RowView
                    key={`row-${option.id}`}
                    option={option}
                    // If previously selected an option, and it is the same one, set it to null
                    onClick={ () => props.onSelect(option.id === selectedID ? null : option) }
                    { ... option.id === selectedID && { showDetails : true } }
                />
            )
        }
    </div>;
}

export default TableView;
