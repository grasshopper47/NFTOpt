import React from "react";
import Layout from "../frontend/fragments/Layout";
import OptionViewContainer from "../frontend/components/OptionViewContainer";

export default function()
{
    return <>
        <Layout>
            <OptionViewContainer key={`explore-list`}/>
        </Layout>
    </>;
}