// @ts-ignore
import classes from "./styles/ViewContainer.module.scss";
import clsx from "clsx";

import React from "react";
import { useEffect, useState } from "react";
import { useAccount, useChainID } from "../pages/_app";
import { OptionWithAsset } from "../../models/option";
import { connected, network, provider, signer } from "../utils/metamask";
import { filterParams } from "./FilterBox";
import TableView, { TableViewLimits } from "./TableView";
import ListView, { ListViewLimits } from "./ListView";
import { Tab, Tabs } from "@mui/material";
import FooterNavigation, { page } from "./FooterNavigation";
import ViewSettings, { view, ViewTypes } from "./ViewSettings";
import { doFilter, optionsByStateFiltered, OptionStateViewed } from "../../datasources/filtering";
import { contracts, createNFTOptInstance } from "../../datasources/NFTOpt";
import { loadAll } from "../../datasources/options";
import { attachNFTOptHandlersToInstance } from "../controllers/NFTOpt";

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

    // Force-update the view even when the selectedOption is the same value; this is to cover the edge-case
    // when the user modifies 2 or more options, with transactions queued in Metamask and aproving 1 by 1
    _updateViewCallback();
}

let _setViewedOptionsCallback : (list : OptionWithAsset[]) => void;

const handleFiltered = () =>
{
    console.log("filtered");

    doFilter(optionViewState, filterParams).then(_setViewedOptionsCallback);
}

const renderStatusText = (hasItems : boolean, activeTabIndex : number) =>
{
    if (hasItems) return <></>;

    let getStatus = () =>
    {
        if (activeTabIndex === 0)
        {
            if (network())
            {
                if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no requests";

                return "Done";
            }

            return "No Requests";
        }

        if (network())
        {
            if (optionsByStateFiltered[optionViewState]?.length === 0) return "Filter matched no options";

            return "Done";
        }

        return "No Options";
    }

    return <p className={classes.noOptions}>{getStatus()}</p>;
}

const renderList = (options : OptionWithAsset[]) =>
{
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

function ViewContainer()
{
    const [ activeTabIndex , setActiveTabIndex ] = useState( parseInt(localStorage[tabIndexStorageKey] ?? 0) );
    const [ viewedOptions  , setViewedOptions ]  = useState<OptionWithAsset[]>([]);

    const [, setSelectedOptionChanged ] = useState(0);

    const updateView = () => setSelectedOptionChanged(f => f ^ 1);

    _setViewedOptionsCallback = setViewedOptions;
    _updateViewCallback       = updateView;

    const account = useAccount();
    const chainID = useChainID();

    const hasItems = viewedOptions ? viewedOptions.length !== 0 : false;

    useEffect
    (
        () =>
        {
            setViewedOptions([]);

            let network_ = network();
            if (!network_) return;

            // Initialize
            contracts.NFTOpt = createNFTOptInstance(provider(), network_);

            // Load data
            loadAll(contracts.NFTOpt).then(handleFiltered);

            // Subscribe to events
            attachNFTOptHandlersToInstance(contracts.NFTOpt, handleFiltered, handleFiltered);
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (!network()) return;

            // Create an upgraded/downgraded instance with connected address as signer
            // OR with the default provider (readonly)
            // NOTE: event subscription is maintained
            contracts.NFTOpt = contracts.NFTOpt?.connect(connected() ? signer() : provider());
        }
    ,   [account]
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

            if (!optionsFiltered || optionsFiltered.length === 0)
            {
                handleFiltered();
                return;
            }

            setViewedOptions(optionsFiltered);
        }
    ,   [activeTabIndex]
    );

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
                list={viewedOptions}
                rowViewLimitList={view.type === ViewTypes.ROWLIST ? TableViewLimits : ListViewLimits}
                onNavigate={updateView}
            />
        }
    </>;
}

export default ViewContainer;
