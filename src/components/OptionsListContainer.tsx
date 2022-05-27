import { Tab, Tabs, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { OptionState, OptionWithNFTDetails } from "../utils/types";
import OptionDetailsPreview from "./OptionDetailsPreview";
import OptionListItemPreview from "./OptionListItemPreview";
import classes from "./styles/OptionsListContainer.module.scss";
import { useAccount } from "../providers/contexts";

type OptionsListContainerProps = {
    title: string;
    options: OptionWithNFTDetails[];
};

type OptionStateTab = {
    name: string;
    optionState: OptionState;
};

const optionStateTabs: OptionStateTab[] = [
    {
        name: "Unfilled",
        optionState: OptionState.REQUEST,
    },
    {
        name: "Filled",
        optionState: OptionState.OPEN,
    },
    {
        name: "Closed",
        optionState: OptionState.CLOSED,
    },
];

function OptionsListContainer(props: OptionsListContainerProps) {
    const { options, title } = props;

    const account = useAccount();

    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [filteredOptions, setFilteredOptions] = useState<OptionWithNFTDetails[]>([]);
    const [selectedOptionForPreview, setSelectedOptionForPreview] = useState<OptionWithNFTDetails | null>(null);

    const handleChangeTab = (_, tabIndex: number) => {
        setActiveTabIndex(tabIndex);
    };

    useEffect(() => {
        setFilteredOptions(options.filter((option) => option.state === optionStateTabs[activeTabIndex].optionState));
        if (selectedOptionForPreview) {
            setSelectedOptionForPreview(null);
        }
    }, [activeTabIndex, options]);

    return (
        <div className={classes.root}>
            <Typography className={classes.title}>{title}</Typography>
            <Tabs className={classes.tabs} value={activeTabIndex} onChange={handleChangeTab}>
                {optionStateTabs.map((optionStateTab) => (
                    <Tab key={`option-state-tab-${optionStateTab.name}`} label={optionStateTab.name} />
                ))}
            </Tabs>

            {selectedOptionForPreview ? (
                <div className={classes.containerItem}>
                    <OptionDetailsPreview
                        key={`option-details-preview-${selectedOptionForPreview.id}`}
                        currentAccount={account}
                        option={selectedOptionForPreview}
                        onSelectOption={setSelectedOptionForPreview}
                    />
                </div>
            ) : (
                <div className={classes.containerGrid}>
                    {filteredOptions.length ? (
                        filteredOptions.map((option, index) => (
                            <OptionListItemPreview
                                key={`option-preview-${activeTabIndex}-${index}`}
                                option={option}
                                onSelectOptionForPreview={setSelectedOptionForPreview}
                            />
                        ))
                    ) : (
                        <Typography className={classes.noOptions}>No Options</Typography>
                    )}
                </div>
            )}
        </div>
    );
}

export default OptionsListContainer;
