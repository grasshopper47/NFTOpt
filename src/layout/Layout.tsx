import React from "react";
import Header from "../components/Header";

// @ts-ignore
export default function Layout({children}) {
    return (
        <>
            <Header/>
            <main>{children}</main>
        </>
    );
}
