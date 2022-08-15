// @ts-ignore
import classes from "./styles/Header.module.scss";
import clsx from "clsx";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { network, provider } from "../../datasources/provider";
import { connected, connecting, connectWallet } from "../utils/metamask";
import { getAccountDisplayValue } from "../utils/helpers";
import { useAccount, useChainID } from "../utils/contexts";
import ThemeSwitch from "../fragments/ThemeSwitch.Header";
import Button from "@mui/material/Button";

type Route =
{
    href: string
,   name: string
};

let routesReadOnly: Route[] =
[
    {
        href: "/explore"
    ,   name: "Explore"
    }
,   {
        href: "/team"
    ,   name: "Team™"
    }
];

let routesWithSigner : Route[] =
[
    {
        href: "/mint"
    ,   name: "Mint"
    }
,   {
        href: "/request"
    ,   name: "Publish"
    }
];

let hasProvider : boolean;

let chainID : number;
let account : string;

let routes    : Route[];
let routePrev : string = "";

let isRestrictable = (pathname: string) =>
{
    return !network
        ||  (!connected && !connecting)
        &&  routesWithSigner.find(r => r.href == pathname) != null;
}

function Header()
{
    chainID = useChainID();
    account = useAccount();

    const router  = useRouter();

    useEffect
    (
        () =>
        {
            if (connected === undefined) return; // First run ignored

            if (isRestrictable(router.pathname))
            {
                router.replace(router.pathname, "/404").then( () => router.push("/404") );
                routePrev = router.pathname.toString();

                return;
            }

            // Navigate back to where the user was before
            if (routePrev.length !== 0)
            {
                router.replace("/404", routePrev)
                .then( () => { router.push(routePrev); routePrev = ""; } );
            }
        }
    ,   [chainID]
    );

    useEffect
    (
        () =>
        {
            if (connected === undefined) return; // First run ignored

            if (isRestrictable(router.pathname))
            {
                router.replace(router.pathname, "/404").then( () => router.push("/404") );

                return;
            }

            if (router.pathname !== "/explore") document.body.onclick = null;
        }
    ,   [router.pathname]
    );

    hasProvider = provider != null;

    routes = [];

    if (network && hasProvider)
    {
        if (connected) routes.push(... routesWithSigner);

        routes.push(... routesReadOnly);
    }

    return <div className={classes.root}>
        <Link key="route-link-main" href="/">
            <a className={clsx(classes.link, classes.logo)}>
                NFT-OթͲ
            </a>
        </Link>

        { !network && <p>{ hasProvider ? "Connect to localhost" : "Metamask required to access dapp" }</p> }

        <div>
            {
                routes.map
                (
                    route =>
                    <Link
                        key={`route-link-${route.href}`}
                        href={route.href}>
                        <a className={clsx(classes.link, router.pathname == route.href && classes.active)}>
                            {route.name}
                        </a>
                    </Link>
                )
            }

            <ThemeSwitch />

            <Button
                className={clsx(classes.connectBtn, connected && classes.connectBtnSmall)}
                variant="contained"
                { ... !connected && !connecting &&
                    {
                        onClick : hasProvider ? connectWallet : () => window.open("https://metamask.io/download")
                    }
                }
            >
                <p>{ connected ? getAccountDisplayValue(account) : (hasProvider ? "Connect wallet" : "Install Metamask") }</p>
            </Button>
        </div>
    </div>;
}

export default Header;
