// @ts-ignore
import classes from "../styles/components/OptionViewContainer.module.scss";

import { FormControlLabel, Switch, Tab, Tabs } from "@mui/material";
import { useEffect, useState } from "react";
import { OptionState, OptionWithAsset } from "../utils/types";
import OptionDetailsView from "./OptionDetailsView";
import OptionListItemView from "./OptionListItemView";
import { useOptions, useOptionsHash } from "../pages/_app";
import { account, network } from "../utils/metamask";
import clsx from "clsx";
import { isLoading } from "../utils/options";

export enum Views { CARDLIST, DETAIL, LISTDETAIL };

type ViewTab =
{
    name  : string;
    value : OptionState;
};

const tabs: ViewTab[] =
[
    {
        name  : "Requests",
        value : OptionState.PUBLISHED,
    },
    {
        name  : "Open",
        value : OptionState.OPEN,
    },
    {
        name  : "Closed",
        value : OptionState.CANCELED,
    },
];

const viewStates =
{
    [Views.CARDLIST] : [ "S", "M", "L" ]
,   [Views.LISTDETAIL] : [ "25", "50", "100" ]
}

export function getViewClass(view : Views, state : number)
{
    return viewStates[view][state];
}

function OptionViewContainer()
{
    const [ view, setView ] = useState<Views>(Views.CARDLIST);
    const [ viewState, setViewState ] = useState(0);
    const [ activeTabIndex, setActiveTabIndex ] = useState(0);
    const [ viewedOptions, setViewedOptions ] = useState<OptionWithAsset[]>([]);
    const [ selectedOption, setSelectedOption ] = useState<OptionWithAsset | null>(null);
    const [ checked, setChecked ] = useState(false);

    const options = useOptions();
    const optionsHash = useOptionsHash();

    useEffect
    (
        () =>
        {
            if (view === Views.DETAIL) return;

            setViewedOptions
            (
                options.filter
                (
                    (option : OptionWithAsset) =>
                    {
                        let state = tabs[activeTabIndex].value;

                        let cond : boolean;

                        if (state === OptionState.CANCELED)
                            cond = option.state === OptionState.WITHDRAWN || option.state === OptionState.CANCELED;
                        else
                            cond = option.state === state;

                        if (checked) cond = cond && (option.buyer === account() || option.seller === account());

                        return cond;
                    }
                )
            );
        }
    ,   [optionsHash, activeTabIndex]
    );

    useEffect
    (
        () =>
        {
            if (selectedOption) setView(Views.DETAIL);
            else                setView(Views.CARDLIST);
        }
    ,   [selectedOption]
    );

    const onSetTab       = (event: any, index : number) => setActiveTabIndex(index);
    const onSetViewState = (event: any, index : number) => setViewState(index);

    return <>
        <p className="page-title">Explore NFT Options</p>

        <div className={classes.root}>
            {
                viewedOptions.length !== 0 &&
                <>
                    <Tabs
                        className={classes.tabs}
                        value={activeTabIndex}
                        onChange={onSetTab}
                    >
                    {
                        tabs.map
                        (
                            optionStateTab =>
                            <Tab key={`option-state-tab-${optionStateTab.name}`}
                                label={optionStateTab.name}
                                disabled={selectedOption !== null}
                            />
                        )
                    }
                    </Tabs>

                    <Tabs
                        className={classes.tabsState}
                        value={viewState}
                        onChange={onSetViewState}
                    >
                    {
                        viewStates[view]?.map
                        (
                            state =>
                            <Tab key={`option-view-state-tab-${state}`}
                                label={state}
                                disabled={selectedOption !== null}
                            />
                        )
                    }
                    </Tabs>

                    <FormControlLabel
                        className={clsx(classes.checkbox, !checked ? classes.unchecked : classes.checked)}
                        control={<Switch checked={checked} onChange={() => setChecked(!checked)}/>}
                        disabled={selectedOption !== null}
                        label={(checked ? "Account's" : "All") + " Options"}
                        labelPlacement="start"
                    />
                </>
            }

            {
                view == Views.CARDLIST &&
                <div className={clsx(classes.containerGrid, viewedOptions.length ? classes[getViewClass(view, viewState)] : classes.empty)}
                >
                {
                    isLoading() && !viewedOptions.length &&
                    <p className={classes.noOptions}>Loading Options ...</p>
                }
                {
                    viewedOptions.map
                    (
                        (option, index) =>
                        <OptionListItemView
                            key={`option-preview-${activeTabIndex}-${index}`}
                            option={option}
                            onViewOptionDetails={setSelectedOption}
                            view={viewState}
                        />
                    )
                }
                {
                    !isLoading() && !viewedOptions.length &&
                    <p className={classes.noOptions}>No Options</p>
                }
                </div>
            }

            {
                view == Views.DETAIL && selectedOption &&
                <div className={classes.containerItem}>
                    <OptionDetailsView
                        key={`option-details-preview-${selectedOption.id}`}
                        option={selectedOption}
                        showListView={setSelectedOption.bind(null, null)}
                    />
                </div>
            }
        </div>
    </>;
}

export default OptionViewContainer;