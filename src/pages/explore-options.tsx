import React from "react";
import Layout from "../components/Layout";
import OptionViewContainer from "../components/OptionViewContainer";
import { OptionFilterOwnership } from "../utils/types";

function ExploreOptions() {
    return (
        <Layout>
            <OptionViewContainer
                key={`explore-options-list`}
                title={"Explore NFT Options"}
                filterOwnership={OptionFilterOwnership.ALL}
            />
        </Layout>
    );
}

export default ExploreOptions;