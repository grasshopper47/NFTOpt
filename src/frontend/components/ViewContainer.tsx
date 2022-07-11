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
import { filterParams } from "./FilterBox";
import TableView, { TableViewLimits } from "./TableView";
import ListView, { ListViewLimits } from "./ListView";
import { Tab, Tabs } from "@mui/material";
import FooterNavigation, { page } from "./FooterNavigation";
import ViewSettings, { view, ViewTypes } from "./ViewSettings";

enum ViewTabValues { REQUEST, OPEN, CLOSED };

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

const tabIndexStorageKey  = "ActiveTabIndex";

let selectedOption: OptionWithAsset | null = null;

let optionsByStateFiltered = {};
for (let k of Object.keys(ViewTabValues)) optionsByStateFiltered[k] = [] as OptionWithAsset[];

const MAX_INT_STRING = (Number.MAX_SAFE_INTEGER - 1).toString();

let optionViewState = ViewTabValues.REQUEST;

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

    const account  = useAccount();
    const requests = useRequests();
    const options  = useOptions();

    const hasItems = viewedOptions.length !== 0;

    useEffect
    (
        () => handleFilteredWithReset()
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

            if (optionsByStateFiltered[optionViewState] === undefined) handleFiltered();
            else setViewedOptions(optionsByStateFiltered[optionViewState]);
        }
    ,   [activeTabIndex]
    );

    const handleFiltered = () =>
    {
        let map = optionViewState === ViewTabValues.REQUEST ? requests.map : options.map;

        let stateFilter = (s : OptionState) => true;
        if (optionViewState === ViewTabValues.OPEN)   stateFilter = (s : OptionState) => s === OptionState.OPEN;
        if (optionViewState === ViewTabValues.CLOSED) stateFilter = (s : OptionState) => s === OptionState.CANCELED || s === OptionState.EXERCISED;

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

        optionsByStateFiltered[optionViewState] = map;

        setViewedOptions(map);
    }

    const handleFilteredWithReset = () =>
    {
        optionsByStateFiltered = { };

        handleFiltered();
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
                    if (requests.hash === 0)                                  return "Loading Requests ...";
                    if (optionsByStateFiltered[optionViewState].length === 0) return "No Requests matching filter";

                    return "Done";
                }

                return "No Requests";
            }

            if (network())
            {
                if (options.hash === 0)                                   return "Loading Options ...";
                if (optionsByStateFiltered[optionViewState].length === 0) return "No Options matching filter";

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
            list      : viewedOptions.slice(startIndex, startIndex + page.count)
        ,   onSelect  : setSelectedOption
        ,   viewIndex : view.state
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
