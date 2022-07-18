// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React from "react";
import { useEffect, useState } from "react";
import { useRequests, useOptions } from "../pages/_app";
import { OptionWithAsset } from "../../models/extended";
import { network } from "../utils/metamask";
import { filterParams } from "./FilterBox";
import TableView, { TableViewLimits } from "./TableView";
import ListView, { ListViewLimits } from "./ListView";
import { Tab, Tabs } from "@mui/material";
import FooterNavigation, { page } from "./FooterNavigation";
import ViewSettings, { view, ViewTypes } from "./ViewSettings";
import { doFilter, optionsByStateFiltered, OptionStateViewed } from "../../datasources/filtering";

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

let selectedOption: OptionWithAsset | null = null;

let optionViewState = OptionStateViewed.REQUEST;

let previousHash =
{
    requests : 0
,   options  : 0
}

function ViewContainer()
{
    const [ activeTabIndex , setActiveTabIndex ] = useState( parseInt(localStorage[tabIndexStorageKey] ?? 0) );
    const [ viewedOptions  , setViewedOptions ]  = useState<OptionWithAsset[]>([]);

    const [, setState] = useState(false);

    // Used by child controls
    const updateView = () => setState(s => !s);

    // Force-update the view even when the selectedOption is the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    const setSelectedOption = (obj: OptionWithAsset | null) =>
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

        updateView();
    }

    const requests = useRequests();
    const options  = useOptions();

    const hasItems = viewedOptions ? viewedOptions.length !== 0 : false;

    const handleFiltered = () =>
    {
        doFilter(optionViewState, filterParams).then(setViewedOptions);

        if (activeTabIndex === 0) { previousHash.requests = requests.hash; }
        if (activeTabIndex === 1) { previousHash.options = options.hash; }
    }

    // Re-apply filter when hashes change
    useEffect
    (
        () => { handleFiltered(); }
    ,   [requests.hash, options.hash]
    );

    useEffect
    (
        () =>
        {
            selectedOption = null;
            page.index = 0;

            localStorage[tabIndexStorageKey] = activeTabIndex;

            optionViewState = tabs[activeTabIndex].value;
            let optionsFiltered = optionsByStateFiltered[optionViewState];

            if
            (
                !optionsFiltered || optionsFiltered.length === 0
                || ( previousHash.requests !== requests.hash && activeTabIndex == 0)
                || ( previousHash.options !== options.hash && activeTabIndex == 1)
            )
            {
                handleFiltered();
                return;
            }

            setViewedOptions(optionsFiltered);
        }
    ,   [activeTabIndex]
    );

    const renderStatusText = () =>
    {
        if (hasItems) return <></>;

        let getStatus = () =>
        {
            if (activeTabIndex === 0)
            {
                if (network())
                {
                    if (requests.hash === 0)                                   return "Loading Requests ...";
                    if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no requests";

                    return "Done";
                }

                return "No Requests";
            }

            if (network())
            {
                if (options.hash === 0)                                    return "Loading Options ...";
                if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no options";

                return "Done";
            }

            return "No Options";
        }

        return <p className={classes.noOptions}>{getStatus()}</p>;
    }

    const renderList = () =>
    {
        let startIndex = page.index * page.count;
        let props =
        {
            list      : viewedOptions?.slice(startIndex, startIndex + page.count)
        ,   viewIndex : view.state
        ,   onSelect  : setSelectedOption
        ,   onSorted  : (list: OptionWithAsset[]) => setViewedOptions(list)
        };

        if (selectedOption) props["selectedValue"] = selectedOption;

        return view.type === ViewTypes.ROWLIST
            ? <TableView { ... props} />
            : <ListView { ... props} />;
    }

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={clsx(classes.root, hasItems && classes.withOptions)}>
            {
                view.type !== ViewTypes.DETAIL &&
                <ViewSettings
                    list={viewedOptions}
                    selectedValue={selectedOption}
                    onViewChanged={updateView}
                    onFilter={handleFiltered}
                />
            }

            <Tabs
                className={classes.tabs}
                value={activeTabIndex}
                onChange={(e, index : number) => setActiveTabIndex(index)}
            >
                { tabs.map( tab => <Tab key={`tab-filter-${tab.name}`} label={tab.name} /> ) }
            </Tabs>

            { renderStatusText() }
            { renderList() }
        </div>
        {
            hasItems && view.type !== ViewTypes.DETAIL &&
            <FooterNavigation
                list={viewedOptions}
                rowViewLimitList={view.type === ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits}
                onNavigate={updateView}
            />
        }
    </>;
}

export default ViewContainer;
