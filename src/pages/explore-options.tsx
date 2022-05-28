import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import OptionsListContainer from "../components/OptionsListContainer";
import { Option, OptionWithNFTDetails } from "../utils/types";
import { useContracts } from "../providers/contexts";
import { fetchNFTDetailsForMultipleOptions } from "../utils/NFT/localhost";
import { loadContractOptions } from "../utils/options";

function ExploreOptions() {
    const { nftOpt } = useContracts();
    const [contractOptions, setContractOptions] = useState<Option[]>([]);
    const [optionsWithNFTDetails, setOptionsWithNFTDetails] = useState<OptionWithNFTDetails[]>([]);

    useEffect(() => {
        loadContractOptions(nftOpt, setContractOptions);
    }, [nftOpt]);

    useEffect(() => {
        fetchNFTDetailsForMultipleOptions(contractOptions, setOptionsWithNFTDetails);
    }, [contractOptions]);

    return (
        <Layout>
            <OptionsListContainer
                key={`explore-options-list`}
                title={"Explore NFT Options"}
                options={optionsWithNFTDetails}
            />
        </Layout>
    );
}

export default ExploreOptions;
