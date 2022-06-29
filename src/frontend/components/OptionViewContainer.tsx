// @ts-ignore
import classes from "./styles/OptionViewContainer.module.scss";
import clsx from "clsx";

import { FormControlLabel, Switch, Tab, Tabs } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { OptionState } from "../../models/option";
import { OptionWithAsset } from "../../models/extended";
import OptionDetailsView from "./OptionDetailsView";
import OptionListItemView from "./OptionListItemView";
import { useOptions, useOptionsHash, useRequests, useRequestsHash } from "../../pages/_app";
import { network } from "../utils/metamask";

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

export const getViewClassName = (view : Views, state : number) => viewStates[view][state];

function OptionViewContainer()
{
    const [ view           , setView ]           = useState<Views>(Views.CARDLIST);
    const [ viewStateIndex , setViewStateIndex ] = useState(0);
    const [ activeTabIndex , setActiveTabIndex ] = useState(0);
    const [ viewedOptions  , setViewedOptions ]  = useState<OptionWithAsset[]>([]);
    const [ selectedOption , setSelectedOption ] = useState<OptionWithAsset | null>(null);
    const [ checked        , setChecked ]        = useState(false);

    const optionsByState = useRef({});

    const requests     = useRequests();
    const requestsHash = useRequestsHash();
    const options      = useOptions();
    const optionsHash  = useOptionsHash();

    useEffect
    (
        () => setViewStateIndex( parseInt(localStorage[viewStateStorageKey] ?? 0) )
    ,   []
    );

    useEffect
    (
        () =>
        {
            optionsByState.current[ViewTabValues.REQUEST] = [] as OptionWithAsset[];

            let map = optionsByState.current[ViewTabValues.REQUEST];

            for (let request of requests) map.push(request);

            if (activeTabIndex === 0) setViewedOptions(optionsByState.current[ViewTabValues.REQUEST]);
        }
    ,   [requestsHash]
    );

    useEffect
    (
        () =>
        {
            optionsByState.current[ViewTabValues.OPEN]   = [] as OptionWithAsset[];
            optionsByState.current[ViewTabValues.CLOSED] = [] as OptionWithAsset[];

            let map1 = optionsByState.current[ViewTabValues.OPEN];
            let map2 = optionsByState.current[ViewTabValues.CLOSED];

            for (let option of options)
            {
                if (option.state === OptionState.OPEN) { map1.push(option); continue; }

                map2.push(option);
            }

            if (activeTabIndex !== 0) setViewedOptions(optionsByState.current[tabs[activeTabIndex].value]);
        }
    ,   [optionsHash]
    );

    useEffect
    (
        () =>
        {
            if (requests.length === 0 && options.length === 0) return;  // 1st run, skip until options are loaded

            setViewedOptions(optionsByState.current[tabs[activeTabIndex].value]);
        }
    ,   [activeTabIndex]
    );

    useEffect
    (
        () =>
        {
            if (selectedOption)
            {
                document.body.onkeydown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedOption(null) };
                setView(Views.DETAIL);

                return;
            }

            document.body.onkeydown = null;
            setView(Views.CARDLIST);
        }
    ,   [selectedOption]
    );

    const handleTabChanged = (event: any, index : number) => setActiveTabIndex(index);

    const handleViewStateChanged = (event: any, index : number) =>
    {
        localStorage[viewStateStorageKey] = index;
        setViewStateIndex(index);
    }

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={classes.root}>
        {
            view == Views.CARDLIST &&
            <>
                <Tabs
                    className={classes.tabs}
                    value={activeTabIndex}
                    onChange={handleTabChanged}
                >
                {
                    tabs.map
                    (
                        optionStateTab =>
                        <Tab key={`option-state-tab-${optionStateTab.name}`}
                            label={optionStateTab.name}
                        />
                    )
                }
                </Tabs>

                {
                    viewedOptions.length !== 0 &&
                    <FormControlLabel
                        className={clsx(classes.checkbox, !checked ? classes.unchecked : classes.checked)}
                        control={<Switch checked={checked} onChange={() => setChecked(!checked)}/>}
                        disabled={selectedOption !== null}
                        label={(checked ? "Account's" : "All") + " Options"}
                        labelPlacement="start"
                    />
                }

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
                    <p className={classes.noOptions}>
                    {
                        network()
                        ?
                            optionsHash === 0 && "Loading Options ..."
                            ||  optionsHash === 1
                                &&
                                (
                                    !options.length && "No Options"
                                    || !viewedOptions.length && "Done"
                                )
                            ||  !viewedOptions.length && "No Options"
                        :
                            "No Options"
                    }
                    </p>
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
                    {
                        viewStates[view]?.map
                        (
                            state =>
                            <Tab key={`option-view-state-tab-${state}`}
                                label={state}
                            />
                        )
                    }
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