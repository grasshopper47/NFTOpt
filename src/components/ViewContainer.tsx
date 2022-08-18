// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { network } from "../../datasources/provider";
import { optionsChanged, requestsChanged } from "../../datasources/options";
import { doFilter, optionsByStateFiltered, OptionStateViewed } from "../../datasources/filtering";
import { OptionWithAsset } from "../../models/option";
import { clearNFTOptUICallback, setNFTOptUICallback } from "../controllers/NFTOpt";
import { clearOptionsUICallback, setOptionsUICallback, useChainID } from "../utils/contexts";
import { ViewTypes, ViewPage, ViewConfig, getViewSettingsFromStorage, getViewLimitIndexFromStorage, ListViewLimits, TableViewLimits } from "../utils/view";
import TableView from "./TableView";
import ListView from "./ListView";
import FooterNavigation from "./FooterNavigation";
import ViewSettings from "./ViewSettings";
import { Tab, Tabs } from "@mui/material";

const setSelectedOption = (obj : OptionWithAsset | null) =>
{
    selectedOption = obj;

    if (selectedOption)
    {
        document.body.onkeydown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedOption(null); };

        if (view.type === ViewTypes.CARDLIST) view.type = ViewTypes.DETAIL;
    }
    else
    {
        document.body.onkeydown = null;

        if (view.type === ViewTypes.DETAIL) view.type = ViewTypes.CARDLIST;
    }

    // Force-update the view even when the selectedOption is the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    viewChanged();
}

const handleFiltered = () => doFilter(optionViewState).then(setViewedOptions);

const getStatusText = (activeTabIndex : number) =>
{
    if (activeTabIndex === 0)
    {
        if (network)
        {
            if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no requests";

            return "Loading...";
        }

        return "No Requests";
    }

    if (network)
    {
        if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no options";

        return "Loading...";
    }

    return "No Options";
}

const renderList = () =>
{
    if (!hasItems) return <p className={classes.noOptions}>{ getStatusText(activeTabIndex) }</p>;

    const startIndex = page.index * page.count;
    const props =
    {
        list      : viewedOptions.slice(startIndex, startIndex + page.count)
    ,   viewIndex : view.state
    ,   onSelect  : setSelectedOption
    };

    if (selectedOption) props["selectedValue"] = selectedOption;

    return view.type === ViewTypes.ROWLIST
        ?   <TableView { ... props } onSort={ (list : OptionWithAsset[]) => setViewedOptions(list) } />
        :   <ListView  { ... props } />;
}

const doClean = () => { clearOptionsUICallback(), clearNFTOptUICallback(); }

let hasItems       : boolean;
let chainID        : number;
let activeTabIndex : number;
let optionViewState = OptionStateViewed.REQUEST;
let selectedOption  = null as OptionWithAsset | null;
let viewedOptions   = [] as OptionWithAsset[];
let view =
{
    type  : ViewTypes.CARDLIST
,   state : 0
} as ViewConfig;

const tabIndexStorageKey = "ActiveTabIndex";

const page =
{
    index: 0
,   count: 0
} as ViewPage;

const tabs =
[
    {
        name  : "Requests"
    ,   value : OptionStateViewed.REQUEST
    }
,   {
        name  : "Open"
    ,   value : OptionStateViewed.OPEN
    }
,   {
        name  : "Closed"
    ,   value : OptionStateViewed.CLOSED
    }
];

let viewChanged       : () => void;
let setActiveTabIndex : (a : number) => void;
let setViewedOptions  : (a : OptionWithAsset[]) => void;

function ViewContainer()
{
    const [          , setSelectedOptionChanged ] = useState(0);
    [ activeTabIndex , setActiveTabIndex ]        = useState(0);
    [ viewedOptions  , setViewedOptions ]         = useState<OptionWithAsset[]>([]);

    viewChanged = () => setSelectedOptionChanged(f => f ^ 1);

    chainID  = useChainID();
    hasItems = viewedOptions ? viewedOptions.length !== 0 : false;

    setOptionsUICallback(handleFiltered);
    setNFTOptUICallback(handleFiltered);

    useEffect
    (
        () =>
        {
            view = getViewSettingsFromStorage();

            page.count = (ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits)[getViewLimitIndexFromStorage()];

            setActiveTabIndex( parseInt(localStorage[tabIndexStorageKey] ?? 0) );

            // Cleanup on unmount
            return () => doClean();
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network)
            {
                doClean();

                setViewedOptions([]);
            }
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            localStorage[tabIndexStorageKey] = activeTabIndex;

            selectedOption = null;
            page.index = 0;
            optionViewState = tabs[activeTabIndex].value;

            if (requestsChanged.value)
            {
                if (activeTabIndex === 0)
                {
                    delete optionsByStateFiltered[OptionStateViewed.REQUEST];
                    requestsChanged.value = false;
                }
            }

            if (optionsChanged.value)
            {
                if (activeTabIndex !== 0)
                {
                    delete optionsByStateFiltered[OptionStateViewed.OPEN];
                    delete optionsByStateFiltered[OptionStateViewed.CLOSED];
                    optionsChanged.value = false;
                }
            }

            const options = optionsByStateFiltered[optionViewState];
            if (options)
            {
                // Handle server-triggered refresh
                if (options === viewedOptions) viewedOptions = [];

                setViewedOptions(options);
            }
            else handleFiltered();
        }
    ,   [activeTabIndex]
    );

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={clsx(classes.root, hasItems && classes.withOptions)}>
            {
                hasItems && view.type !== ViewTypes.DETAIL &&
                <ViewSettings
                    view={view}
                    list={viewedOptions}
                    selectedValue={selectedOption}
                    onViewChanged={viewChanged}
                    onFilter={handleFiltered}
                />
            }

            <Tabs
                className={classes.tabs}
                value={activeTabIndex}
                onChange={ (e, index : number) => setActiveTabIndex(index) }
            >
                { tabs.map( tab => <Tab key={`tab-filter-${tab.name}`} label={tab.name} /> ) }
            </Tabs>

            { renderList() }
        </div>
        {
            hasItems && view.type !== ViewTypes.DETAIL &&
            <FooterNavigation
                page={page}
                list={viewedOptions}
                recordLimits={view.type === ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits}
                onNavigate={viewChanged}
            />
        }
    </>;
}

export default ViewContainer;
