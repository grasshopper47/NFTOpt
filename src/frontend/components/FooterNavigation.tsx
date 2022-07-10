// @ts-ignore
import classes from "./styles/FooterNavigation.module.scss";

import React, { useEffect } from "react";
import { OptionWithAsset } from "../../models/extended";
import { Button, MenuItem, Select } from "@mui/material";
import { ViewPage } from "./ViewContainer";

type Props =
{
    list         : OptionWithAsset[]
,   rowCountList : number[]
,   onChange     : (page: ViewPage) => void
};

const itemLimitStorageKey = "ItemLimit";
let itemLimitIndex = 0;
let page : ViewPage = { index: 0, count: 0 };

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
            page.count = props.rowCountList[itemLimitIndex];

            props.onChange({ ... page });
        }
    ,   [props.rowCountList]
    );

    const setPageCount = (event: any) =>
    {
        let index = event.target.value;

        localStorage[itemLimitStorageKey] = index;

        itemLimitIndex = index;

        page.count = props.rowCountList[index];

        let maxPageCount = Math.floor(props.list.length / page.count);

        if (page.index > maxPageCount) page.index = maxPageCount;

        props.onChange({ ... page });
    }

    const setPageIndex = (a : number) =>
    {
        page.index = a;

        props.onChange({ ... page });
    }

    return <div className={classes.records}>
        <Select
            MenuProps={{ classes: { paper: classes.dropDown } }}
            className={classes.dropDown}
            value={itemLimitIndex}
            onChange={setPageCount}
        >
            {
                props.rowCountList.map
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
