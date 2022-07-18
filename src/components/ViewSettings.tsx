// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { OptionWithAsset } from "../../models/extended";
import FilterBox from "./FilterBox";
import { ListViewStates } from "./ListView";
import { Button, MenuItem, Select } from "@mui/material";

const viewTypeStorageKey  = "ViewType";
const viewStateStorageKey = "ViewState";

export enum ViewTypes { CARDLIST, DETAIL, ROWLIST };

export type ViewConfig =
{
    type  : ViewTypes
,   state : number
}

export let view : ViewConfig =
{
    type  : ViewTypes.CARDLIST
,   state : 0
};

type Props =
{
    list            : OptionWithAsset[]
,   selectedValue ?: OptionWithAsset | null
,   onViewChanged   : () => void
,   onFilter        : () => void
};

function ViewSettings(props: Props)
{
    const [ isFilterBoxVisible , setFilterBoxVisibile ] = useState(false);

    useEffect
    (
        () =>
        {
            view =
            {
                type  : parseInt(localStorage[viewTypeStorageKey] ?? ViewTypes.CARDLIST)
            ,   state : parseInt(localStorage[viewStateStorageKey] ?? 0)
            }

            props.onViewChanged();

            document.body.onclick = () => setFilterBoxVisibile(false);
        }
    ,   []
    );

    const handleViewStateChanged = (event : any) =>
    {
        let index = event.target.value;

        localStorage[viewStateStorageKey] = index;

        view.state = index;

        props.onViewChanged();
    }

    const hasItems = props.list.length !== 0;

    return <div className={classes.viewSettingsWrapper}>
        {
            hasItems && view.type === ViewTypes.CARDLIST &&
            <Select
                MenuProps={{ classes: { paper: classes.dropDown } }}
                className={clsx(classes.dropDown, classes.viewStateDropDown)}
                value={view.state}
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
                        let newView = ViewTypes.CARDLIST;

                        if (view.type === ViewTypes.CARDLIST) newView = ViewTypes.ROWLIST;
                        else if (props.selectedValue)        newView = ViewTypes.DETAIL;

                        localStorage[viewTypeStorageKey] = view.type = newView;

                        props.onViewChanged();
                    }
                }
            >{ view.type === ViewTypes.CARDLIST ? "🧾" : "🎴" }</Button>
        }

        <Button
            className={classes.btnShow}
            onClick={ (e) => { setFilterBoxVisibile(true); e.stopPropagation(); } }
        >🔰</Button>

        { isFilterBoxVisible && <FilterBox onFilter={props.onFilter} /> }
    </div>;
}

export default ViewSettings;
