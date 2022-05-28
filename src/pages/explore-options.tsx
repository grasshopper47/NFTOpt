import React from "react";
import Layout from "../components/Layout";
import OptionsListContainer from "../components/OptionsListContainer";
import {OptionFilterOwnership} from "../utils/types";

function ExploreOptions() {
    return (
        <Layout>
            <OptionsListContainer
                key={`explore-options-list`}
                title={"Explore NFT Options"}
                filterOwnership={OptionFilterOwnership.ALL}
            />
        </Layout>
    );
}

export default ExploreOptions;
