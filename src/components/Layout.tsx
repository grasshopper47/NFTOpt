import React from "react";
import Head from "next/head";
import Header from "../components/Header";
import {WithChildren} from "../utils/declarations";

function Layout(props: WithChildren) {
    return (
        <div key="main-content-layout" className="main-content-layout">
            <Header />
            <div className="main-content-wrapper">{props.children}</div>
        </div>
    );
}

export default Layout;
