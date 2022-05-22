import React from "react";
import {WithChildren} from "../utils/declarations";

function Layout(props: WithChildren) {
    return (
        <div key="main-content-layout" className="main-content-layout">
            <div className="main-content-wrapper">{props.children}</div>
        </div>
    );
}

export default Layout;
