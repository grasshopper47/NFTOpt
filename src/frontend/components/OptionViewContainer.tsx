// @ts-ignore
import classes from "./styles/OptionViewContainer.module.scss";
import clsx from "clsx";

import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useRequests, useOptions, useAccount } from "../../pages/_app";
import { OptionState } from "../../models/option";
import { OptionWithAsset } from "../../models/extended";
import OptionDetailsView from "./OptionDetailsView";
import OptionListItemView from "./OptionListItemView";
import { network } from "../utils/metamask";
import FilterBox, { filterParams } from "./FilterBox";
import { Button, Tab, Tabs } from "@mui/material";

enum ViewTabValues { REQUEST, OPEN, CLOSED };

export enum Views { CARDLIST, DETAIL, LISTDETAIL };

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
    [Views.CARDLIST]   : [ "S", "M", "L" ]
,   [Views.LISTDETAIL] : [ "25", "50", "100" ]
}

const viewStateStorageKey = "ListViewState";
const tabIndexStorageKey = "ActiveTabIndex";

export const getViewClassName = (view : Views, state : number) => viewStates[view][state];

let selectedOption: OptionWithAsset | null = null;

let optionsByStateFiltered = {};

const MAX_INT_STRING = (Number.MAX_SAFE_INTEGER - 1).toString();

function OptionViewContainer()
{
    const [ view           , setView ]           = useState<Views>(Views.CARDLIST);
    const [ viewStateIndex , setViewStateIndex ] = useState( 0 );
    const [ activeTabIndex , setActiveTabIndex ] = useState( 0 );
    const [ viewedOptions  , setViewedOptions ]  = useState<OptionWithAsset[]>([]);

    const [ isFilterBoxVisible, setFilterBoxVisibile ] = useState(false);
    const hide = () => setFilterBoxVisibile(false);
    // parseInt(localStorage[viewStateStorageKey] ?? 0)
    // parseInt(localStorage[tabIndexStorageKey] ?? 0)
    // Force-update the view even when the selectedOption is of the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    const [, setState] = useState(0);
    const setSelectedOption = (obj: OptionWithAsset | null) =>
    {
        selectedOption = obj;

        setState( c => ++c );
    }

    const account  = useAccount();
    const requests = useRequests();
    const options  = useOptions();

    useEffect
    (
        () => document.body.onclick = hide
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

            // 1st run, skip until options are loaded
            // if (requests.map.length === 0 && options.map.length === 0) return;

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
                setView(Views.DETAIL);
            }
            else
            {
                document.body.onkeydown = null;
                setView(Views.CARDLIST);
            }
        }
    ,   [selectedOption]
    );

    const handleViewStateChanged = (event: any, index : number) =>
    {
        localStorage[viewStateStorageKey] = index;

        setViewStateIndex(index);
    }

    const getStatus = () =>
    {
        if (activeTabIndex === 0)
        {
            if (network() && requests.hash === 0) return "Loading Requests ...";

            return "No Requests";
        }

        if (network() && options.hash === 0) return "Loading Options ...";

        return "No Options";
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

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={classes.root}>
        {
            view == Views.CARDLIST &&
            <>
                <Button
                    className={classes.btnShow}
                    onClick={ (e) => { e.stopPropagation(); setFilterBoxVisibile(true); } }
                >🔰</Button>

                { isFilterBoxVisible && <FilterBox onChange={ () => handleFilteredWithReset(tabs[activeTabIndex].value) }/> }

                <Tabs
                    className={classes.tabs}
                    value={activeTabIndex}
                    onChange={(e, index : number) => setActiveTabIndex(index)}
                >
                    { tabs.map( tab => <Tab key={`tab-filter-${tab.name}`} label={tab.name} /> ) }
                </Tabs>

                <div
                    className=
                    {
                        clsx
                        (
                            classes.containerGrid
                        ,   network() && viewedOptions.length && classes[getViewClassName(view, viewStateIndex)]
                        ,   viewedOptions.length ? classes.gridWithOptions : classes.gridEmpty
                        )
                    }
                >
                    {
                        !viewedOptions.length &&
                        <p className={classes.noOptions}>{getStatus()}</p>
                    }
                    {
                        viewedOptions.map
                        (
                            (option, index) =>
                            <OptionListItemView
                                key={`option-preview-${activeTabIndex}-${index}`}
                                option={option}
                                showDetailsView={setSelectedOption}
                                viewIndex={viewStateIndex}
                            />
                        )
                    }
                </div>

                {
                    viewedOptions.length !== 0 &&
                    <Tabs
                        className={classes.tabsState}
                        value={viewStateIndex}
                        onChange={handleViewStateChanged}
                    >
                        { viewStates[view]?.map( state => <Tab key={`tab-view-state-${state}`} label={state} /> ) }
                    </Tabs>
                }
            </>
        }

        {
            view == Views.DETAIL && selectedOption &&
            <div className={classes.containerItem}>
                <OptionDetailsView
                    key={`option-details-preview-${selectedOption.id}`}
                    option={selectedOption}
                    showListView={ () => setSelectedOption(null) }
                />
            </div>
        }
        </div>
    </>;
}

export default OptionViewContainer;