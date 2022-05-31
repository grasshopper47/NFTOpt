import React from "react";
import Layout from "../components/Layout";
import OptionListView from "../components/OptionListView";
import { OptionFilterOwnership } from "../utils/types";

function ExploreOptions() {
    return (
        <Layout>
            <OptionListView
                key={`explore-options-list`}
                title={"Explore NFT Options"}
                filterOwnership={OptionFilterOwnership.ALL}
            />
        </Layout>
    );
}

export default ExploreOptions;