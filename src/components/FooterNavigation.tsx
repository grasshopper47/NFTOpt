// @ts-ignore
import classes from "../styles/components/FooterNavigation.module.scss";

import React from "react";
import { OptionWithAsset } from "../../models/option";
import { Button, MenuItem, Select } from "@mui/material";
import { getViewLimitIndexFromStorage, storeViewRecordsLimitIndex, ViewPage } from "../utils/view";

const setPageIndex = (a : number) =>
{
    _propsPtr.page.index = a;

    _propsPtr.onNavigate();
}

const setPageCount = (event: any) =>
{
    const index = event.target.value;

    storeViewRecordsLimitIndex(index);

    _propsPtr.page.count = _propsPtr.recordLimits[index];

    const maxPageCount = Math.floor(_propsPtr.list.length / _propsPtr.page.count);

    if (_propsPtr.page.index > maxPageCount) _propsPtr.page.index = maxPageCount;

    _propsPtr.onNavigate();
}

type Props =
{
    page         : ViewPage
,   list         : OptionWithAsset[]
,   recordLimits : number[]
,   onNavigate   : () => void
};

let _propsPtr : Props;

function FooterNavigation(props : Props)
{
    _propsPtr = props;

    return <div className={classes.records}>
        <Select
            MenuProps={{ classes: { paper: classes.dropDown } }}
            className={classes.dropDown}
            value={getViewLimitIndexFromStorage()}
            onChange={setPageCount}
        >
            {
                props.recordLimits.map
                (
                    (limit, index) =>
                    <MenuItem key={`tab-view-limits-${limit}`} value={index}>{limit}</MenuItem>
                )
            }
        </Select>

        <Button
            disabled={props.page.index === 0}
            onClick={() => setPageIndex(0)}
        >⏪</Button>

        <Button
            disabled={props.page.index === 0}
            onClick={() => setPageIndex(--props.page.index)}
        >◀</Button>

        <p>Page {props.page.index + 1} of {Math.ceil(props.list.length / props.page.count)}</p>

        <Button
            disabled={props.page.index === Math.floor(props.list.length / props.page.count)}
            onClick={() => setPageIndex(++props.page.index)}
        >▶</Button>

        <Button
            disabled={props.page.index === Math.floor(props.list.length / props.page.count)}
            onClick={() => setPageIndex(Math.floor(props.list.length / props.page.count))}
        >⏩</Button>

        <p>{props.list.length} records</p>
    </div>;
}

export default FooterNavigation;
