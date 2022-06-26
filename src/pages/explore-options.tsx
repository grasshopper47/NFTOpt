import React from "react";
import Layout from "../components/Layout";
import OptionViewContainer from "../frontend/componenets/OptionViewContainer";

function ExploreOptions()
{
    return <>
        <Layout>
            <OptionViewContainer key={`explore-options-list`}/>
        </Layout>
    </>;
}

export default ExploreOptions;