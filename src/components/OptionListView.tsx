import { Tab, Tabs } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { OptionFilterOwnership, OptionState, OptionWithAsset } from "../utils/types";
import OptionDetailsView from "./OptionDetailsView";
import OptionListItemView from "./OptionListItemView";
import classes from "./styles/OptionListView.module.scss";
import { useAccount, useContracts } from "../providers/contexts";
import { loadOptionsWithAsset } from "../utils/options";

type OptionListViewProps =
{
    title: string;
    filterOwnership: OptionFilterOwnership;
};

type OptionStateTab =
{
    name: string;
    optionState: OptionState;
};

const optionStateTabs: OptionStateTab[] =
[
    {
        name: "Requests",
        optionState: OptionState.REQUEST,
    },
    {
        name: "Open",
        optionState: OptionState.OPEN,
    },
    {
        name: "Closed",
        optionState: OptionState.CLOSED,
    },
];

function OptionListView(props: OptionListViewProps) {
    const { title, filterOwnership } = props;

    const account = useAccount();
    const { nftOpt } = useContracts();

    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const [optionsWithAsset, setOptionsWithAsset] = useState<OptionWithAsset[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<OptionWithAsset[]>([]);
    const [selectedOptionForPreview, setSelectedOptionForPreview] = useState<OptionWithAsset | null>(null);
    const lastSelectedOptionId = useRef<number | null>(null); // TODO: make an array for options in progress

    useEffect
    (
        () =>
        {
            loadOptionsWithAsset(nftOpt)
            .then
            (
                (options) =>
                {
                    console.log("loaded", options);
                    setOptionsWithAsset(options);
                }
            );
        },
    []
    );

    // Filter by active tab
    useEffect
    (
        () =>
        {
            const state = optionStateTabs[activeTabIndex].optionState;

            setFilteredOptions
            (
                optionsWithAsset?.filter
                (
                    (option) =>
                    state === OptionState.OPEN || state === OptionState.REQUEST
                        ? option.state === state
                        : option.state === OptionState.WITHDRAWN || option.state === OptionState.CLOSED
                )
            );

            if (selectedOptionForPreview) { setSelectedOptionForPreview(null); }
        },
    [
        activeTabIndex,
        optionsWithAsset
    ]
    );

    const handleChangeTab = (_, tabIndex: number) => setActiveTabIndex(tabIndex);

    return (
        <div className={classes.root}>
            <p className={classes.title}>{title}</p>
            <Tabs className={classes.tabs} value={activeTabIndex} onChange={handleChangeTab}>
                {optionStateTabs.map((optionStateTab) => (
                    <Tab key={`option-state-tab-${optionStateTab.name}`} label={optionStateTab.name} />
                ))}
            </Tabs>

            {selectedOptionForPreview ? (
                <div className={classes.containerItem}>
                    <OptionDetailsView
                        key={`option-details-preview-${selectedOptionForPreview.id}`}
                        currentAccount={account}
                        option={selectedOptionForPreview}
                        onSelectOption={setSelectedOptionForPreview}
                        lastSelectedOptionId={lastSelectedOptionId}
                    />
                </div>
            ) : (
                <div className={classes.containerGrid}>
                    {filteredOptions?.length ? (
                        filteredOptions?.map((option, index) => (
                            <OptionListItemView
                                key={`option-preview-${activeTabIndex}-${index}`}
                                option={option}
                                onSelectOptionForPreview={setSelectedOptionForPreview}
                            />
                        ))
                    ) : (
                        <p className={classes.noOptions}>No Options</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default OptionListView;