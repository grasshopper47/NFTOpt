// @ts-ignore
import classes from "./styles/FooterNavigation.module.scss";

import React, { useEffect } from "react";
import { OptionWithAsset } from "../../models/extended";
import { Button, MenuItem, Select } from "@mui/material";

export type ViewPage =
{
    index : number
,   count : number
};

export let page : ViewPage =
{
    index: 0
,   count: 0
};

let itemLimitIndex = 0;

const itemLimitStorageKey = "ItemLimit";

type Props =
{
    list             : OptionWithAsset[]
,   rowViewLimitList : number[]
,   onNavigate       : () => void
};

function FooterNavigation(props: Props)
{
    useEffect
    (
        () => { itemLimitIndex = parseInt(localStorage[itemLimitStorageKey] ?? 0); }
    ,   []
    );

    useEffect
    (
        () =>
        {
            page.count = props.rowViewLimitList[itemLimitIndex];

            props.onNavigate();
        }
    ,   [props.rowViewLimitList]
    );

    const setPageCount = (event: any) =>
    {
        let index = event.target.value;

        localStorage[itemLimitStorageKey] = index;

        itemLimitIndex = index;

        page.count = props.rowViewLimitList[index];

        let maxPageCount = Math.floor(props.list.length / page.count);

        if (page.index > maxPageCount) page.index = maxPageCount;

        props.onNavigate();
    }

    const setPageIndex = (a : number) =>
    {
        page.index = a;

        props.onNavigate();
    }

    return <div className={classes.records}>
        <Select
            MenuProps={{ classes: { paper: classes.dropDown } }}
            className={classes.dropDown}
            value={itemLimitIndex}
            onChange={setPageCount}
        >
            {
                props.rowViewLimitList.map
                (
                    (limit, index) =>
                    <MenuItem key={`tab-view-limits-${limit}`} value={index}>{limit}</MenuItem>
                )
            }
        </Select>

        <Button
            disabled={page.index === 0}
            onClick={() => setPageIndex(0)}
        >⏪</Button>

        <Button
            disabled={page.index === 0}
            onClick={() => setPageIndex(--page.index)}
        >◀</Button>

        <p>Page {page.index + 1} of {Math.ceil(props.list.length / page.count)}</p>

        <Button
            disabled={page.index === Math.floor(props.list.length / page.count)}
            onClick={() => setPageIndex(++page.index)}
        >▶</Button>

        <Button
            disabled={page.index === Math.floor(props.list.length / page.count)}
            onClick={() => setPageIndex(Math.floor(props.list.length / page.count))}
        >⏩</Button>

        <p>{props.list.length} records</p>
    </div>;
}

export default FooterNavigation;
