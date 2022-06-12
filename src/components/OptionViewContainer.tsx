import classes from "./styles/OptionViewContainer.module.scss";
import { Tab, Tabs } from "@mui/material";
import OptionDetailsView from "./OptionDetailsView";
import OptionListItemView from "./OptionListItemView";
import { useEffect, useState } from "react";
import { OptionFilterOwnership, OptionState, OptionWithAsset } from "../utils/types";
import { useAccount, useOptions } from "../providers/contexts";

type OptionViewContainerProps =
{
    title: string;
    filterOwnership: OptionFilterOwnership;
};

type ViewTab =
{
    name  : string;
    value : OptionState;
};

const tabs: ViewTab[] =
[
    {
        name  : "Requests",
        value : OptionState.REQUEST,
    },
    {
        name  : "Open",
        value : OptionState.OPEN,
    },
    {
        name  : "Closed",
        value : OptionState.CLOSED,
    },
];

function OptionViewContainer(props: OptionViewContainerProps)
{
    const { title } = props;

    const [ activeTabIndex, setActiveTabIndex ] = useState(0);
    const [ optionsDisplayed, setOptionsDisplayed ] = useState<OptionWithAsset[]>([]);
    const [ selectedOption, setSelectedOption ] = useState<OptionWithAsset | null>(null);

    const account = useAccount();
    const options = useOptions();

    useEffect
    (
        () =>
        {
            if (!options || options.length === 0) { return; }

            const state = tabs[activeTabIndex].value;

            const filter =
            (option : OptionWithAsset) =>
            {
                if (state === OptionState.OPEN || state === OptionState.REQUEST)
                {
                    return option.state === state;
                }

                return option.state === OptionState.WITHDRAWN || option.state === OptionState.CLOSED;
            };

            setOptionsDisplayed(options.filter(filter));
        },
        [
            activeTabIndex,
            options
        ]
    );

    const handleChangeTab = (_, tabIndex: number) => setActiveTabIndex(tabIndex);

    return (
        <div className={classes.root}>
            <p className={classes.title}>{title}</p>
            <Tabs
                className={classes.tabs}
                value={activeTabIndex}
                onChange={handleChangeTab}
            >
                {tabs.map((optionStateTab) => (
                    <Tab key={`option-state-tab-${optionStateTab.name}`} label={optionStateTab.name} />
                ))}
            </Tabs>

            {selectedOption ? (
                <div className={classes.containerItem}>
                    <OptionDetailsView
                        key={`option-details-preview-${selectedOption.id}`}
                        currentAccount={account}
                        option={selectedOption}
                        onSelectOption={setSelectedOption}
                    />
                </div>
            ) : (
                <div className={classes.containerGrid}>
                    { optionsDisplayed?.length ? (
                        optionsDisplayed?.map((option, index) => (
                            <OptionListItemView
                                key={`option-preview-${activeTabIndex}-${index}`}
                                option={option}
                                onViewOptionDetails={setSelectedOption}
                            />
                        ))
                    ) : (
                        <p className={classes.noOptions}>No Options</p>
                    ) }
                </div>
            )}
        </div>
    );
}

export default OptionViewContainer;