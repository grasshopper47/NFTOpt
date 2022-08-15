// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { network } from "../../datasources/provider";
import { optionsChanged, requestsChanged } from "../../datasources/options";
import { doFilter, filterParams, optionsByStateFiltered, OptionStateViewed } from "../../datasources/filtering";
import { OptionWithAsset } from "../../models/option";
import { clearNFTOptUICallback, setNFTOptUICallback } from "../controllers/NFTOpt";
import { clearOptionsUICallback, setOptionsUICallback, useChainID } from "../utils/contexts";
import { ViewTypes, ViewPage, ViewConfig, getViewSettingsFromStorage, getViewLimitIndexFromStorage, ListViewLimits, TableViewLimits } from "../utils/view";
import TableView from "./TableView";
import ListView from "./ListView";
import FooterNavigation from "./FooterNavigation";
import ViewSettings from "./ViewSettings";
import { Tab, Tabs } from "@mui/material";

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

const tabIndexStorageKey  = "ActiveTabIndex";

let selectedOption : OptionWithAsset | null = null;

let optionViewState = OptionStateViewed.REQUEST;

let _updateViewCallback : () => void;

let setSelectedOption = (obj: OptionWithAsset | null) =>
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
    _updateViewCallback();
}

let _setViewedOptionsCallback : (list : OptionWithAsset[]) => void;

let handleFiltered = () =>
{
    console.log("filtered");

    doFilter(optionViewState, filterParams).then(_setViewedOptionsCallback);
}

let renderStatusText = (hasItems : boolean, activeTabIndex : number) =>
{
    if (hasItems) return <></>;

    let getStatus = () =>
    {
        if (activeTabIndex === 0)
        {
            if (network)
            {
                if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no requests";

                return "Done";
            }

            return "No Requests";
        }

        if (network)
        {
            if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no options";

            return "Done";
        }

        return "No Options";
    }

    return <p className={classes.noOptions}>{getStatus()}</p>;
}

let renderList = (options : OptionWithAsset[]) =>
{
    if (!hasItems) return <></>;

    let startIndex = page.index * page.count;
    let props =
    {
        list      : options.slice(startIndex, startIndex + page.count)
    ,   viewIndex : view.state
    ,   onSelect  : setSelectedOption
    ,   onSorted  : (list: OptionWithAsset[]) => _setViewedOptionsCallback(list)
    };

    if (selectedOption) props["selectedValue"] = selectedOption;

    return view.type === ViewTypes.ROWLIST ? <TableView { ... props} /> : <ListView { ... props} />;
}

let doClean = () => { clearOptionsUICallback(), clearNFTOptUICallback(); }

let hasItems : boolean;
let chainID  : number;

let view : ViewConfig =
{
    type  : ViewTypes.CARDLIST
,   state : 0
};

let page : ViewPage =
{
    index: 0
,   count: 0
};

function ViewContainer()
{
    const [                , setSelectedOptionChanged ] = useState(0);
    const [ activeTabIndex , setActiveTabIndex ]        = useState(0);
    const [ viewedOptions  , setViewedOptions ]         = useState<OptionWithAsset[]>([]);

    _updateViewCallback       = () => setSelectedOptionChanged(f => f ^ 1);
    _setViewedOptionsCallback = setViewedOptions;

    chainID  = useChainID();
    hasItems = viewedOptions ? viewedOptions.length !== 0 : false;

    useEffect
    (
        () =>
        {
            view = getViewSettingsFromStorage();

            page.count = (ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits)[getViewLimitIndexFromStorage()];

            setActiveTabIndex(parseInt(localStorage[tabIndexStorageKey] ?? 0));
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network) { doClean(); return; }

            setOptionsUICallback(handleFiltered);
            setNFTOptUICallback(handleFiltered);

            // Cleanup on unmount
            return () => doClean();
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
                    requestsChanged.value = false;
                    handleFiltered();

                    return;
                }
            }

            if (optionsChanged.value)
            {
                if (activeTabIndex !== 0)
                {
                    optionsChanged.value = false;
                    handleFiltered();

                    return;
                }
            }

            setViewedOptions(optionsByStateFiltered[optionViewState]);
        }
    ,   [activeTabIndex]
    );

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={clsx(classes.root, hasItems && classes.withOptions)}>
            {
                view.type !== ViewTypes.DETAIL &&
                <ViewSettings
                    view={view}
                    list={viewedOptions}
                    selectedValue={selectedOption}
                    onViewChanged={_updateViewCallback}
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

            { renderStatusText(hasItems, activeTabIndex) }
            { renderList(viewedOptions) }
        </div>
        {
            hasItems && view.type !== ViewTypes.DETAIL &&
            <FooterNavigation
                page={page}
                list={viewedOptions}
                recordLimits={view.type === ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits}
                onNavigate={_updateViewCallback}
            />
        }
    </>;
}

export default ViewContainer;
