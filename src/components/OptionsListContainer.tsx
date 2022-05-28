import { Tab, Tabs } from "@mui/material";
import React, { useEffect, useState } from "react";
import { OptionFilterOwnership, OptionState, OptionWithAsset } from "../utils/types";
import OptionDetailsPreview from "./OptionDetailsPreview";
import OptionListItemPreview from "./OptionListItemPreview";
import classes from "./styles/OptionsListContainer.module.scss";
import { useAccount, useContracts } from "../providers/contexts";
import toast from "react-hot-toast";
import { loadContractOptions, loadOptionWithAsset } from "../utils/options";
import { fetchNFTDetailsForMultipleOptions } from "../utils/NFT/localhost";

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
        name: "Filled",
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
        const options = await loadContractOptions(nftOpt);
        const optionsWithAsset = await fetchNFTDetailsForMultipleOptions(options);
        if (filterOwnership === OptionFilterOwnership.ALL) {
            setOptionsWithAsset(optionsWithAsset);
        }
        if (filterOwnership === OptionFilterOwnership.ALL) {
            setOptionsWithAsset(
                optionsWithAsset.filter((option) => option.buyer === account || option.seller === account)
            );
        }
    };

    // Fetch options with NFT details
    useEffect(() => {
        if (!nftOpt || !account) {
            return;
        }
        handleLoadOptions();
    }, [nftOpt, account, filterOwnership]);

    // Attach listeners
    const handleUpdateOption = async (optionId: number) => {
        const updatedOption = await loadOptionWithAsset(nftOpt, optionId);
        setOptionsWithAsset((prev) => [...prev.filter((x) => x.id !== optionId), updatedOption]);
    };

    const success = async (message: string, tx) => {
        const optionId = tx?.args?.[1]?.toNumber();
        if (optionId != null) {
            handleUpdateOption(optionId);
        }
        toast.success("Successfully " + message);
    };

    const attachEventListeners = () => {
        nftOpt.on("Exercised", (from, amount, tx) => {
            success("exercised the option request", tx);
            setActiveTabIndex(2);
        });
        nftOpt.on("Filled", (from, amount, tx) => {
            success("filled the option request", tx);
            setActiveTabIndex(1);
        });
        nftOpt.on("Canceled", (from, amount, tx) => {
            success("canceled the option request", tx);
            setActiveTabIndex(2);
        });
        nftOpt.on("Withdrawn", (from, amount, tx) => {
            success("withdrawn the option request", tx);
            setActiveTabIndex(2);
        });
    };

    useEffect(() => {
        if (!nftOpt) {
            return;
        }
        attachEventListeners();

        return () => {
            nftOpt?.removeAllListeners();
        };
    }, [nftOpt]);

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
