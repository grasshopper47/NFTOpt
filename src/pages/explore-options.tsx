import React from "react";
import Layout from "../components/Layout";
import OptionViewContainer from "../components/OptionViewContainer";

function ExploreOptions()
{
    return <>
        <Layout>
            <OptionViewContainer title={"Explore NFT Options"} key={`explore-options-list`}/>
        </Layout>
    </>;
}

export default ExploreOptions;