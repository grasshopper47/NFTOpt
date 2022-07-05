// @ts-ignore
import classes from "./styles/OptionViewContainer.module.scss";
import clsx from "clsx";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRequests, useOptions, useAccount } from "../../pages/_app";
import { OptionState } from "../../models/option";
import { OptionWithAsset } from "../../models/extended";
import OptionCardView from "./OptionCardView";
import OptionRowView from "./OptionRowView";
import OptionDetailsView from "./OptionDetailsView";
import { network } from "../utils/metamask";
import FilterBox, { filterParams } from "./FilterBox";
import { Button, Tab, Tabs } from "@mui/material";

enum ViewTabValues { REQUEST, OPEN, CLOSED };

export enum Views { CARDLIST, DETAIL, ROWLIST };

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

const viewStates =
{
    [Views.CARDLIST] : [ "S", "M", "L" ]
,   [Views.ROWLIST]  : [ "25", "50", "100" ]
}

const viewTypeStorageKey = "ListViewType";
const viewStateStorageKey = "ListViewState";
const tabIndexStorageKey = "ActiveTabIndex";

export const getViewClassName = (view : Views, state : number) => viewStates[view][state];

let selectedOption: OptionWithAsset | null = null;

let optionsByStateFiltered = {};

const MAX_INT_STRING = (Number.MAX_SAFE_INTEGER - 1).toString();

let updateViewedOptionsHash : () => void;

enum SortMode { ASCENDING, DESCENDING };
let sortMode = SortMode.DESCENDING;

function OptionViewContainer()
{
    const [ view              , setView ]              = useState<Views>( parseInt(localStorage[viewTypeStorageKey] ?? Views.CARDLIST) );
    const [ viewStateIndex    , setViewStateIndex ]    = useState( parseInt(localStorage[viewStateStorageKey] ?? 0) );
    const [ activeTabIndex    , setActiveTabIndex ]    = useState( parseInt(localStorage[tabIndexStorageKey] ?? 0) );
    const [ viewedOptions     , setViewedOptions ]     = useState<OptionWithAsset[]>([]);
    const [ viewedOptionsHash , setViewedOptionsHash ] = useState(0);

    // For sorting the viewed options in-place (ROWLIST view)
    updateViewedOptionsHash = () => setViewedOptionsHash( h => ++h );

    const [ isFilterBoxVisible, setFilterBoxVisibile ] = useState(false);
    const hideFilterBox = () => setFilterBoxVisibile(false);

    // Force-update the view even when the selectedOption is the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    const [, setState] = useState(0);
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
        () => handleFilteredWithReset(tabs[activeTabIndex].value)
    ,   [requests.hash, options.hash]
    );

    useEffect
    (
        () =>
        {
            localStorage[tabIndexStorageKey] = activeTabIndex;

            let state = tabs[activeTabIndex].value;

            if (optionsByStateFiltered[state] === undefined) handleFiltered(state);
            else setViewedOptions(optionsByStateFiltered[state]);
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
    ,   [selectedOption]
    );

    const handleViewStateChanged = (event: any, index : number) =>
    {
        localStorage[viewStateStorageKey] = index;

        setViewStateIndex(index);
    }

    const handleFiltered = (state : ViewTabValues) =>
    {
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

    const handleFilteredWithReset = (state : ViewTabValues) =>
    {
        optionsByStateFiltered = { };

        handleFiltered(state);
    }

    const renderListHeaderTabs = () =>
    {
        return <>
            <Tabs
                className={classes.tabs}
                value={activeTabIndex}
                onChange={(e, index : number) => setActiveTabIndex(index)}
            >
                { tabs.map( tab => <Tab key={`tab-filter-${tab.name}`} label={tab.name} /> ) }
            </Tabs>
        </>;
    }

    const renderListViewTypeButton = () =>
    {
        if (!hasItems) return <></>;

        return <>
            <Button
                className={classes.btnListView}
                onClick=
                {
                    () =>
                    {
                        let newView = view === Views.CARDLIST ? Views.ROWLIST : Views.CARDLIST;

                        localStorage[viewTypeStorageKey] = newView;

                        setView(newView);
                    }
                }
            >{ view === Views.CARDLIST ? "Rows" : "Cards" }</Button>
        </>
    }

    const renderFilterBoxButton = () =>
    {
        if (!hasItems) return <></>;

        return <>
            <Button
                className={classes.btnShow}
                onClick={ (e) => { e.stopPropagation(); setFilterBoxVisibile(true); } }
            >🔰</Button>
        </>
    }

    const renderStatusText = () =>
    {
        if (hasItems) return <></>;

        let getStatus = () =>
        {
            if (activeTabIndex === 0)
            {
                if (network() && requests.hash === 0) return "Loading Requests ...";

                return "No Requests";
            }

            if (network() && options.hash === 0) return "Loading Options ...";

            return "No Options";
        }

        return <p className={classes.noOptions}>{getStatus()}</p>;
    }

    const renderList = () =>
    {
        if (view == Views.CARDLIST)
            return viewedOptions.map
            (
                option =>
                <OptionCardView
                    key={`option-card-${activeTabIndex}-${option.id}`}
                    option={option}
                    viewIndex={viewStateIndex}
                    showDetailsView={setSelectedOption}
                />
            )

        let selectedOptionID = selectedOption !== null ? selectedOption.id : -1;

        let sortViewedOptions = (sorter : (a1: OptionWithAsset, a2: OptionWithAsset) => number) =>
        {
            if (sortMode === SortMode.ASCENDING) { viewedOptions.sort(sorter); sortMode = SortMode.DESCENDING; }
            else                                 { viewedOptions.sort((a, b) => sorter(b, a)); sortMode = SortMode.ASCENDING; }

            updateViewedOptionsHash();
        }

        return <>
            {
                hasItems &&
                <div className={classes.listRowsHeader}>
                    <p onClick={ () => sortViewedOptions( (a, b) => b.id - a.id ) }
                    >#</p>

                    <p onClick={ () => sortViewedOptions( (a, b) => b.asset.name.localeCompare(a.asset.name) ) }
                    >Name</p>

                    <p onClick={ () => sortViewedOptions( (a, b) => b.premium.toString().localeCompare(a.premium.toString()) ) }
                    >Premium</p>

                    <p onClick={ () => sortViewedOptions( (a, b) => b.strikePrice.toString().localeCompare(a.strikePrice.toString()) ) }
                    >Strike Price</p>

                    <p onClick={ () => sortViewedOptions( (a, b) => b.interval - a.interval ) }
                    >Interval</p>
                </div>
            }

            {
                viewedOptions.map
                (
                    option =>
                    <div
                        key={`option-row-${activeTabIndex}-${option.id}`}
                        style={{width:"100%", display:"grid"}}
                        // If previously selected an option, and it is the same one, set it to null
                        onClick={ () => setSelectedOption(option.id === selectedOptionID ? null : option) }
                    >
                        <OptionRowView
                            option={option}
                            showDetails={option.id === selectedOptionID}
                        />
                        {
                            option.id === selectedOptionID &&
                            <div className={classes.listRowsDetailWrapper}><OptionDetailsView option={option}/></div>
                        }
                    </div>
                )
            }
        </>
    }

    const renderListViewStateTabs = () =>
    {
        if (!hasItems) return <></>;

        return <>
            <Tabs
                className={classes.tabsState}
                value={viewStateIndex}
                onChange={handleViewStateChanged}
            >
                { viewStates[view]?.map( state => <Tab key={`tab-view-state-${state}`} label={state} /> ) }
            </Tabs>
        </>;
    }

    const renderDetailView = () =>
    {
        if (view !== Views.DETAIL || selectedOption === null) return <></>;

        return <>
            <div className={classes.containerItem}>
                <OptionDetailsView
                    option={selectedOption}
                    showListView={ () => setSelectedOption(null) } />
            </div>
        </>;
    }

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={classes.root}>
        {
            view === Views.DETAIL
            ?   renderDetailView()
            :   <>
                    { renderListViewTypeButton() }
                    { renderFilterBoxButton() }

                    { isFilterBoxVisible && <FilterBox onChange={ () => handleFilteredWithReset(tabs[activeTabIndex].value) }/> }

                    { renderListHeaderTabs() }

                    <div className=
                    {
                        clsx
                        (
                            classes.containerGrid
                        ,   network() && hasItems && classes[ view === Views.CARDLIST ? getViewClassName(view, viewStateIndex) : "rows" ]
                        ,   hasItems && classes.gridWithOptions
                        )
                    } >
                        { renderStatusText() }
                        { renderList() }
                    </div>

                    { renderListViewStateTabs() }
                </>
        }
        </div>
    </>;
}

export default OptionViewContainer;
