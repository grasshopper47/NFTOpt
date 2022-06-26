import React from "react";
import Layout from "../frontend/components/Layout";
import OptionViewContainer from "../frontend/components/OptionViewContainer";

function ExploreOptions()
{
    return <>
        <Layout>
            <OptionViewContainer key={`explore-options-list`}/>
        </Layout>
    </>;
}

export default ExploreOptions;