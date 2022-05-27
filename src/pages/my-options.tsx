import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OptionsListContainer from "../components/OptionsListContainer";
import { Option, OptionState, OptionWithNFTDetails } from "../utils/declarations";
import { useAccount, useContracts } from "../providers/contexts";
import { fetchNFTDetailsForMultipleOptions, loadContractOptions } from "../utils/api";

function MyOptions() {
    const account = useAccount();
    const { nftOpt } = useContracts();

    const [contractOptions, setContractOptions] = useState<Option[]>([]);
    const [currentAccountOptions, setCurrentAccountOptions] = useState<Option[]>([]);
    const [optionsWithNFTDetails, setOptionsWithNFTDetails] = useState<OptionWithNFTDetails[]>([]);

    // Firstly load the contract options
    useEffect(() => {
        loadContractOptions(nftOpt, setContractOptions);
    }, [nftOpt]);

    // Then filter the options for the current account => current account is either seller or buyer
    useEffect(() => {
        setCurrentAccountOptions(
            contractOptions.filter((option) =>
                option.buyer === account ||
                option.seller === account)
        );
    }, [contractOptions, account]);

    // console.log(contractOptions.filter((option) => option.buyer === account || option.seller === account));
    // Then fetch the NFT details for the current account options
    useEffect(() => {
        fetchNFTDetailsForMultipleOptions(currentAccountOptions, setOptionsWithNFTDetails);
    }, [currentAccountOptions]);

    return (
        <Layout>
            <OptionsListContainer key={`my-options-list`} title={"Your NFT Options"} options={optionsWithNFTDetails} />
        </Layout>
    );
}

export default MyOptions;
