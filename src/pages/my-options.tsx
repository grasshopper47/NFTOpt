import React from "react";
import Layout from "../components/Layout";
import OptionViewContainer from "../components/OptionViewContainer";
import {OptionFilterOwnership} from "../utils/types";

function MyOptions() {
    return (
        <Layout>
            <OptionViewContainer
                key={`my-options-list`}
                title={"Your NFT Options"}
                filterOwnership={OptionFilterOwnership.PERSONAL}
            />
        </Layout>
    );
}

export default MyOptions;
