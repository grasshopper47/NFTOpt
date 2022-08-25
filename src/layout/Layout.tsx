import React from "react";
import Header from "../components/Header";

// @ts-ignore
export default function Layout(props : { children : JSX.Element | JSX.Element[] }) {
    return (
        <div key="main-content-layout" className="main-content-layout">
            <Header/>
            <div className="main-content-wrapper">{props.children}</div>
        </div>
    );
}
