// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React from "react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRequests, useOptions, useAccount } from "../../pages/_app";
import { OptionState } from "../../models/option";
import { OptionWithAsset } from "../../models/extended";
import { network } from "../utils/metamask";
import FilterBox, { filterParams } from "./FilterBox";
import TableView, { TableViewLimits } from "./TableView";
import ListView, { ListViewLimits } from "./ListView";
import { Button, MenuItem, Select, Tab, Tabs } from "@mui/material";

enum ViewTabValues { REQUEST, OPEN, CLOSED };

enum Views { CARDLIST, DETAIL, ROWLIST };

type ViewTab =
{
    name  : string
,   value : ViewTabValues
};

const tabs : ViewTab[] =
[
    {
        name  : "Requests"
    ,   value : ViewTabValues.REQUEST
    }
,   {
        name  : "Open"
    ,   value : ViewTabValues.OPEN
    }
,   {
        name  : "Closed"
    ,   value : ViewTabValues.CLOSED
    }
];

const viewLimitStorageKey = "ViewLimit";
const viewStateStorageKey = "ViewState";
const viewTypeStorageKey  = "ViewType";
const tabIndexStorageKey  = "ActiveTabIndex";

let selectedOption: OptionWithAsset | null = null;

let optionsByStateFiltered = {};

const MAX_INT_STRING = (Number.MAX_SAFE_INTEGER - 1).toString();

function ViewContainer()
{
    const [ view           , setView ]           = useState<Views>( parseInt(localStorage[viewTypeStorageKey] ?? Views.CARDLIST) );
    const [ viewStateIndex , setViewStateIndex ] = useState( parseInt(localStorage[viewStateStorageKey] ?? 0) );
    const [ viewLimitIndex , setViewLimitIndex ] = useState( parseInt(localStorage[viewLimitStorageKey] ?? 0) );
    const [ activeTabIndex , setActiveTabIndex ] = useState( parseInt(localStorage[tabIndexStorageKey] ?? 0) );
    const [ viewedOptions  , setViewedOptions ]  = useState<OptionWithAsset[]>([]);

    const [ isFilterBoxVisible, setFilterBoxVisibile ] = useState(false);
    const hideFilterBox = () => setFilterBoxVisibile(false);

    // Force-update the view even when the selectedOption is the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    const [selectedOptionCounter, setState] = useState(0);
    const setSelectedOption = (obj: OptionWithAsset | null) =>
    {
        selectedOption = obj;

        setState(c => ++c);
    }

    const account  = useAccount();
    const requests = useRequests();
    const options  = useOptions();

    const hasItems = viewedOptions.length !== 0;

    useEffect
    (
        () => document.body.onclick = hideFilterBox
    ,   []
    );

    useEffect
    (
        () => handleFilteredWithReset()
    ,   [requests.hash, options.hash]
    );

    useEffect
    (
        () =>
        {
            localStorage[tabIndexStorageKey] = activeTabIndex;

            let state = tabs[activeTabIndex].value;

            if (optionsByStateFiltered[state] === undefined) handleFiltered();
            else setViewedOptions(optionsByStateFiltered[state]);

            selectedOption = null;
        }
    ,   [activeTabIndex]
    );

    useEffect
    (
        () =>
        {
            if (selectedOption)
            {
                document.body.onkeydown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedOption(null); };

                if (view === Views.CARDLIST) setView(Views.DETAIL);

                return;
            }

            document.body.onkeydown = null;

            if (view === Views.DETAIL) setView(Views.CARDLIST);
        }
    ,   [selectedOptionCounter]
    );

    const handleViewLimitChanged = (event : any) =>
    {
        let index = event.target.value;

        localStorage[viewLimitStorageKey] = index;

        setViewLimitIndex(index);
    }

    const handleViewStateChanged = (event: any, index : number) =>
    {
        localStorage[viewStateStorageKey] = index;

        setViewStateIndex(index);
    }

    const handleFiltered = () =>
    {
        let state = tabs[activeTabIndex].value;
        let map = state === ViewTabValues.REQUEST ? requests.map : options.map;

        let stateFilter = (s : OptionState) => true;
        if (state === ViewTabValues.OPEN)   stateFilter = (s : OptionState) => s === OptionState.OPEN;
        if (state === ViewTabValues.CLOSED) stateFilter = (s : OptionState) => s === OptionState.CANCELED || s === OptionState.EXERCISED;

        map = map.filter
        (
            o =>
            stateFilter(o.state)
            && (filterParams.showAll || (o.buyer === account || o.seller === account))
            && o.premium.gte(ethers.utils.parseEther(filterParams.premium.min === "" ? "0" : filterParams.premium.min))
            && o.premium.lte(ethers.utils.parseEther(filterParams.premium.max === "" ? MAX_INT_STRING : filterParams.premium.max))
            && o.strikePrice.gte(ethers.utils.parseEther(filterParams.strikePrice.min === "" ? "0" : filterParams.strikePrice.min))
            && o.strikePrice.lte(ethers.utils.parseEther(filterParams.strikePrice.max === "" ? MAX_INT_STRING : filterParams.strikePrice.max))
            && o.interval >= (filterParams.interval.min === "" ? 0  : parseInt(filterParams.interval.min))
            && o.interval <= (filterParams.interval.max === "" ? 30 : parseInt(filterParams.interval.max))
        );

        optionsByStateFiltered[state] = map;

        setViewedOptions(map);
    }

    const handleFilteredWithReset = () =>
    {
        optionsByStateFiltered = { };

        handleFiltered();
    }

    const renderHeaderTabs = () =>
    {
        return <Tabs
            className={classes.tabs}
            value={activeTabIndex}
            onChange={(e, index : number) => setActiveTabIndex(index)}
        >
            { tabs.map( tab => <Tab key={`tab-filter-${tab.name}`} label={tab.name} /> ) }
        </Tabs>;
    }

    const renderViewSettings = () =>
    {
        if (!hasItems || view === Views.DETAIL || !network()) return <></>;

        let list = view === Views.ROWLIST ? TableViewLimits : ListViewLimits;

        return <div className={classes.viewSettingsWrapper}>
            <Select
                MenuProps={{ classes: { paper: classes.dropDownLimits } }}
                className={classes.dropDownLimits}
                value={viewLimitIndex}
                onChange={handleViewLimitChanged}
            >
                {
                    list.map
                    (
                        (limit, index) =>
                        <MenuItem
                            key={`tab-view-limits-${limit}`}
                            value={index}
                        >{limit}</MenuItem>
                    )
                }
            </Select>

            <Button
                className={classes.btnListView}
                onClick=
                {
                    () =>
                    {
                        let newView = view === Views.CARDLIST ? Views.ROWLIST : selectedOption !== null ? Views.DETAIL : Views.CARDLIST;

                        localStorage[viewTypeStorageKey] = newView;

                        setView(newView);
                    }
                }
            >{ view === Views.CARDLIST ? "🧾" : "🎴" }</Button>

            <Button
                className={classes.btnShow}
                onClick={ (e) => { e.stopPropagation(); setFilterBoxVisibile(true); } }
            >🔰</Button>
        </div>;
    }

    const renderStatusText = () =>
    {
        if (hasItems) return <></>;

        let getStatus = () =>
        {
            if (activeTabIndex === 0)
            {
                if (network())
                {
                    if (requests.hash === 0) return "Loading Requests ...";

                    if (optionsByStateFiltered[tabs[activeTabIndex].value].length === 0)
                    {
                        return "No Requests";
                    }

                    return "Done";
                }

                return "No Requests";
            }

            if (network())
            {
                if (options.hash === 0) return "Loading Options ...";

                if (optionsByStateFiltered[tabs[activeTabIndex].value].length === 0)
                {
                    return "No Options";
                }

                return "Done";
            }

            return "No Options";
        }

        return <p className={classes.noOptions}>{getStatus()}</p>;
    }

    const renderList = () =>
    {
        let props =
        {
            list      : viewedOptions
        ,   onSelect  : setSelectedOption
        ,   viewIndex : viewStateIndex
        };

        if (selectedOption) props["selectedValue"] = selectedOption;

        return view === Views.ROWLIST
            ? <TableView { ... props} />
            : <ListView { ... props} />;
    }

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={clsx(classes.root, hasItems && classes.withOptions)}>
            { renderViewSettings() }

            { isFilterBoxVisible && <FilterBox onFilter={handleFilteredWithReset}/> }

            { renderHeaderTabs() }

            { renderStatusText() }
            { renderList() }
        </div>
    </>;
}

export default ViewContainer;
