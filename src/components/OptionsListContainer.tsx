import { Tab, Tabs } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { OptionFilterOwnership, OptionState, OptionWithAsset } from "../utils/types";
import OptionDetailsPreview from "./OptionDetailsPreview";
import OptionListItemPreview from "./OptionListItemPreview";
import classes from "./styles/OptionsListContainer.module.scss";
import { useAccount, useContracts } from "../providers/contexts";
import toast from "react-hot-toast";
import { loadContractOptions, loadOptions, loadOptionWithAsset } from "../utils/options";
import { fetchNFTDetailsForMultipleOptions } from "../utils/NFT/localhost";
import { getCurrentProvider } from "../utils/metamask";

type OptionsListContainerProps = {
    title: string;
    filterOwnership: OptionFilterOwnership;
};

type OptionStateTab = {
    name: string;
    optionState: OptionState;
};

const optionStateTabs: OptionStateTab[] = [
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

function OptionsListContainer(props: OptionsListContainerProps) {
    const { title, filterOwnership } = props;

    const account = useAccount();
    const { nftOpt } = useContracts();

    const [activeTabIndex, setActiveTabIndex] = useState(0);

    const [optionsWithAsset, setOptionsWithAsset] = useState<OptionWithAsset[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<OptionWithAsset[]>([]);
    const [selectedOptionForPreview, setSelectedOptionForPreview] = useState<OptionWithAsset | null>(null);
    const lastSelectedOptionId = useRef<number | null>(null); // TODO: make an array for options in progress

    // Filter by active tab
    useEffect(() => {
        const state = optionStateTabs[activeTabIndex].optionState;
        setFilteredOptions(
            optionsWithAsset?.filter((option) =>
                state === OptionState.OPEN || state === OptionState.REQUEST
                    ? option.state === state
                    : option.state === OptionState.WITHDRAWN || option.state === OptionState.CLOSED
            )
        );
        if (selectedOptionForPreview) {
            setSelectedOptionForPreview(null);
        }
    }, [activeTabIndex, optionsWithAsset]);

    const handleLoadOptions = async () => {
        const options = await loadOptions(nftOpt);
        const optionsWithAsset = await fetchNFTDetailsForMultipleOptions(options);
        setOptionsWithAsset(optionsWithAsset);
    };

    useEffect(() => {
        if (!nftOpt || !account) {
            return;
        }
        handleLoadOptions();
    }, [nftOpt, account, filterOwnership]);

    const handleUpdateOption = async (optionId: number) => {
        const updatedOption = await loadOptionWithAsset(nftOpt, optionId);
        setOptionsWithAsset((prev) => [...prev.filter((x) => x.id !== optionId), updatedOption]);
    };

    const success = async (message: string, tabIndex: number, optionId: number) => {
        if (lastSelectedOptionId.current == null || optionId !== lastSelectedOptionId.current) {
            return;
        }

        setActiveTabIndex(tabIndex);

        if (optionId != null) {
            handleUpdateOption(optionId);
        }
        toast.success("Successfully " + message);
        // TODO: remove from the ref array the current updated option
    };

    const attachEventListeners = () => {
        nftOpt.on("Exercised", (from, tx) => {
            const optionId = tx?.args?.[0]?.toNumber();
            success("exercised the option request", 2, optionId);
        });
        nftOpt.on("Opened", (from, amount, tx) => {
            const optionId = tx?.args?.[1]?.toNumber();
            success("opened the option request", 1, optionId);
        });
        nftOpt.on("Canceled", (from, amount, tx) => {
            const optionId = tx?.args?.[1]?.toNumber();
            success("canceled the option request", 2, optionId);
        });
        nftOpt.on("Withdrawn", (from, amount, tx) => {
            const optionId = tx?.args?.[1]?.toNumber();
            success("withdrawn the option request", 0, optionId);
        });
    };

    useEffect(() => {
        if (!nftOpt || !account) {
            return;
        }
        attachEventListeners();

        return () => {
            nftOpt?.removeAllListeners();
        };
    }, [nftOpt, account]);

    const handleChangeTab = (_, tabIndex: number) => {
        setActiveTabIndex(tabIndex);
    };

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
                    <OptionDetailsPreview
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
                            <OptionListItemPreview
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

export default OptionsListContainer;
