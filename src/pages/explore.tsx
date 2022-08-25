// @ts-ignore
import classes from "../styles/components/ViewContainer.module.scss";
import clsx from "clsx";

import React, { useEffect, useState } from "react";
import { network } from "../../datasources/provider";
import { optionsChanged, requestsChanged } from "../../datasources/options";
import { doFilter, optionsByStateFiltered, OptionStateViewed } from "../../datasources/filtering";
import { OptionWithAsset } from "../../models/option";
import { clearNFTOptUICallback, setNFTOptUICallback } from "../controllers/NFTOpt";
import { clearOptionsLoadCallback, setOptionsLoadCallback, useChainID } from "../utils/contexts";
import { ViewTypes, ViewPage, ViewConfig, getViewConfigFromStorage, getViewLimitIndexFromStorage, ListViewLimits, TableViewLimits } from "../utils/view";
import TableView from "../components/TableView";
import ListView from "../components/ListView";
import FooterNavigation from "../components/FooterNavigation";
import ViewSettings from "../components/ViewSettings";
import { Tab, Tabs } from "@mui/material";

const setSelectedOption = (obj : OptionWithAsset | null) =>
{
    selectedOption = obj;

    if (selectedOption)
    {
        document.body.onkeydown = handleKey;

        if (viewConfig.type === ViewTypes.CARDLIST) viewConfig.type = ViewTypes.DETAIL;
    }
    else
    {
        document.body.onkeydown = null;

        if (viewConfig.type === ViewTypes.DETAIL) viewConfig.type = ViewTypes.CARDLIST;
    }

    // Force-update the view even when the selectedOption is the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    viewChanged();
}

const handleKey = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedOption(null); }

const handleFiltered = () => doFilter(activeTabIndex).then(setViewedOptions);

const renderList = () =>
{
    if (!hasItems) return <p className={classes.noOptions}>{ getStatusText(activeTabIndex) }</p>;

    const startIndex = page.index * page.count;
    const props =
    {
        list      : viewedOptions.slice(startIndex, startIndex + page.count)
    ,   viewIndex : viewConfig.state
    ,   onSelect  : setSelectedOption
    };

    if (selectedOption) { // @ts-ignore
        props["selectedValue"] = selectedOption;
    }

    return viewConfig.type === ViewTypes.ROWLIST
    ?   <TableView
            { ... props }
            onSort={ sorter => { viewedOptions.sort(sorter), viewChanged(); } }
        />
    :   <ListView  { ... props } />;
}

const getStatusText = (activeTabIndex : number) =>
{
    if (activeTabIndex === 0)
    {
        if (network)
        {
            if (optionsByStateFiltered[activeTabIndex]?.length === 0) return "Filter matched no requests";

            return "Loading...";
        }

        return "No Requests";
    }

    if (network)
    {
        if (optionsByStateFiltered[activeTabIndex]?.length === 0) return "Filter matched no options";

        return "Loading...";
    }

    return "No Options";
}

const cleanup = () =>
{
    document.body.onkeydown = null;

    clearOptionsLoadCallback();
    clearNFTOptUICallback();
}

const tabIndexStorageKey = "ActiveTabIndex";

const tabLabels =
[
    "Requests"
,   "Open"
,   "Closed"
];

const page =
{
    index: 0
,   count: 0
} as ViewPage;

let hasItems       : boolean;
let chainID        : number;
let activeTabIndex : OptionStateViewed;
let selectedOption : OptionWithAsset | null;
let viewedOptions  : OptionWithAsset[];
let viewConfig     : ViewConfig;

let viewChanged       : () => void;
let setActiveTabIndex : (a : number) => void;
let setViewedOptions  : (a : OptionWithAsset[]) => void;

viewConfig = {} as ViewConfig;

function ViewContainer()
{
    const [          , selectedOptionChanged ] = useState(0);
    [ activeTabIndex , setActiveTabIndex ]     = useState<OptionStateViewed>(OptionStateViewed.REQUEST);
    [ viewedOptions  , setViewedOptions ]      = useState<OptionWithAsset[]>([]);

    viewChanged = () => selectedOptionChanged(o => o ^ 1);

    chainID  = useChainID();
    hasItems = viewedOptions ? viewedOptions.length !== 0 : false;

    useEffect
    (
        () =>
        {
            viewConfig = getViewConfigFromStorage();

            page.count = (viewConfig.type === ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits)[getViewLimitIndexFromStorage()];

            setActiveTabIndex( parseInt(localStorage[tabIndexStorageKey] ?? 0) );

            return () => cleanup();
        }
    ,   []
    );

    useEffect
    (
        () =>
        {
            if (!network)
            {
                cleanup();

                setViewedOptions([]);

                return;
            }

            setOptionsLoadCallback(handleFiltered);
            setNFTOptUICallback(handleFiltered);
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

            if (!network) return;

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

            // Re-use cache, when available
            const options = optionsByStateFiltered[activeTabIndex];
            if (options)
            {
                // Handle server-triggered refresh
                if (options === viewedOptions) viewedOptions = [];

                setViewedOptions(options);

                return;
            }

            // Re-filter results
            handleFiltered();
        }
    ,   [activeTabIndex]
    );

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={clsx(classes.root, hasItems && classes.withOptions)}>
            {
                viewConfig.type !== ViewTypes.DETAIL &&
                <ViewSettings
                    view={viewConfig}
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
                { tabLabels.map( (t, i) => <Tab key={`tabs-${i}`} label={t} /> ) }
            </Tabs>

            { renderList() }
        </div>
        <>
        {
            hasItems && viewConfig.type !== ViewTypes.DETAIL &&
            <FooterNavigation
                page={page}
                list={viewedOptions}
                recordLimits={viewConfig.type === ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits}
                onNavigate={viewChanged}
            />
        }
        </>
    </>;
}

export default ViewContainer;
