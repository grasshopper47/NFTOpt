import React from "react";
import Layout from "../components/Layout";
import OptionListView from "../components/OptionListView";
import {OptionFilterOwnership} from "../utils/types";

function MyOptions() {
    return (
        <Layout>
            <OptionListView
                key={`my-options-list`}
                title={"Your NFT Options"}
                filterOwnership={OptionFilterOwnership.PERSONAL}
            />
        </Layout>
    );
}

export default MyOptions;
