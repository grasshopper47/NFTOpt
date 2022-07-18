import React from "react";

export default function(props : { children : JSX.Element | JSX.Element[] })
{
    return <div key="main-content-layout" className="main-content-layout">
        <div className="main-content-wrapper">{props.children}</div>
    </div>;
}
