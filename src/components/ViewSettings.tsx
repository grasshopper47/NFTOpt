// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { OptionWithAsset } from "../../models/option";
import { ListViewStates, storeViewState, storeViewType, ViewConfig, ViewTypes } from "../utils/view";
import FilterBox from "./FilterBox";
import { Button, MenuItem, Select } from "@mui/material";

type Props =
{
    view           : ViewConfig
,   list           : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset | null
,   onViewChanged  : () => void
,   onFilter       : () => void
};

let handleViewStateChanged = (event : any) =>
{
    let index = event.target.value;

    storeViewState(index);

    _propsPtr.view.state = index;

    _propsPtr.onViewChanged();
}

let _propsPtr : Props;
let hasItems : boolean;

function ViewSettings(props: Props)
{
    const [ isFilterBoxVisible , setFilterBoxVisibile ] = useState(false);

    _propsPtr = props;

    useEffect
    (
        () =>
        {
            document.body.onclick = () => setFilterBoxVisibile(false);
        }
    ,   []
    );

    hasItems = props.list ? props.list.length !== 0 : false;

    return <div className={classes.viewSettingsWrapper}>
        {
            hasItems && props.view.type === ViewTypes.CARDLIST &&
            <Select
                MenuProps={{ classes: { paper: classes.dropDown } }}
                className={clsx(classes.dropDown, classes.viewStateDropDown)}
                value={props.view.state}
                onChange={handleViewStateChanged}
            >
                {
                    ListViewStates.map
                    (
                        (state, index) =>
                        <MenuItem key={`tab-view-states-${state}`} value={index}>{state}</MenuItem>
                    )
                }
            </Select>
        }
        {
            hasItems &&
            <Button
                className={classes.btnListView}
                onClick=
                {
                    () =>
                    {
                        if (props.selectedValue) props.view.type = ViewTypes.DETAIL;

                        // Switch between ROW and CARD views
                        if (props.view.type < ViewTypes.DETAIL)
                        {
                            props.view.type ^= 1;

                            storeViewType(props.view.type);
                        }

                        props.onViewChanged();
                    }
                }
            >{ props.view.type === ViewTypes.CARDLIST ? "🧾" : "🎴" }</Button>
        }

        <Button
            className={classes.btnShow}
            onClick={ (e) => { setFilterBoxVisibile(true); e.stopPropagation(); } }
        >🔰</Button>

        { isFilterBoxVisible && <FilterBox onFilter={props.onFilter} /> }
    </div>;
}

export default ViewSettings;
