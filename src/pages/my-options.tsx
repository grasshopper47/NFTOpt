import React from "react";
import Layout from "../components/Layout";
import OptionsListContainer from "../components/OptionsListContainer";
import {OptionFilterOwnership} from "../utils/types";

function MyOptions() {
    return (
        <Layout>
            <OptionsListContainer
                key={`my-options-list`}
                title={"Your NFT Options"}
                filterOwnership={OptionFilterOwnership.PERSONAL}
            />
        </Layout>
    );
}

export default MyOptions;
