import React from "react";
import Layout from "../components/Layout";
import OptionsListContainer from "../components/OptionsListContainer";
import {dummyOptions} from "../utils/dummyData";

function ExploreOptions() {
    return (
        <Layout>
            <OptionsListContainer key={`explore-options-list`} title={"Explore NFT Options"} options={dummyOptions} />
        </Layout>
    );
}

export default ExploreOptions;
