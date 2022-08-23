// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { OptionWithAsset } from "../../models/option";
import { ListViewStates, storeViewState, storeViewType, ViewConfig, ViewTypes } from "../utils/view";
import FilterBox from "./FilterBox";
import { Button, MenuItem, Select } from "@mui/material";

const handleViewStateChanged = (event : any) =>
{
    const index = event.target.value;

    storeViewState(index);

    _propsPtr.view.state = index;

    _propsPtr.onViewChanged();
}

const handleViewTypeChanged = () =>
{
    if (_propsPtr.selectedValue) _propsPtr.view.type = ViewTypes.DETAIL;

    // Switch between ROW and CARD views
    if (_propsPtr.view.type < ViewTypes.DETAIL)
    {
        _propsPtr.view.type ^= 1;

        storeViewType(_propsPtr.view.type);
    }

    _propsPtr.onViewChanged();
}

const cleanup = () =>
{
    document.body.onclick = null;
}

let hasItems           : boolean;
let isFilterBoxVisible : boolean;

let setFilterBoxVisibile : (a : boolean) => void;

type Props =
{
    view           : ViewConfig
,   list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset | null
,   onViewChanged  : () => void
,   onFilter       : () => void
};

let _propsPtr = {} as Props;

const viewStatesItems =
ListViewStates.map
(
    (state, i) =>
    <MenuItem key={i} value={i}>{state}</MenuItem>
);

const viewStatesSelect =
<Select
    MenuProps={{ classes: { paper: classes.dropDown } }}
    className={clsx(classes.dropDown, classes.viewStateDropDown)}
    onChange={handleViewStateChanged}
    value={_propsPtr.view ? _propsPtr.view.state : 0}
>
    {viewStatesItems}
</Select>

function ViewSettings(props : Props)
{
    _propsPtr = props;

    [ isFilterBoxVisible , setFilterBoxVisibile ] = useState(false);

    hasItems = props.list ? props.list.length !== 0 : false;

    useEffect
    (
        () =>
        {
            document.body.onclick = () => setFilterBoxVisibile(false);

            return () => cleanup();
        }
    ,   []
    );

    return <div className={classes.viewSettingsWrapper}>
        {
            hasItems && props.view.type === ViewTypes.CARDLIST &&
            viewStatesSelect
        }
        {
            hasItems &&
            <Button
                className={classes.btnListView}
                onClick={handleViewTypeChanged}
            >{ props.view.type === ViewTypes.CARDLIST ? "📋" : "🎴" }</Button>
        }

        <Button
            className={classes.btnShow}
            onClick={ (e) => { setFilterBoxVisibile(true); e.stopPropagation(); } }
        >🔰</Button>

        { isFilterBoxVisible && <FilterBox onFilter={props.onFilter} /> }
    </div>;
}

export default ViewSettings;
