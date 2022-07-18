// @ts-ignore
import classes from "./styles/Header.module.scss";
import clsx from "clsx";

import React, { useEffect } from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import { useAccount } from "../pages/_app";
import { connected, connectWallet, network, provider } from "../utils/metamask";
import { getAccountDisplayValue } from "../utils/helpers";
import ThemeSwitch from "../fragments/ThemeSwitch.Header";
import Button from "@mui/material/Button";

type Route =
{
    href: string
,   name: string
};

const routesReadOnly: Route[] =
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

const routesWithSigner: Route[] =
[
    {
        href: "/request"
    ,   name: "Publish"
    }
,   ... routesReadOnly
];

function Header()
{
    const router = useRouter();
    const account = useAccount();

    useEffect
    (
        () =>
        {
            if (router.pathname !== "/explore") document.body.onclick = null;
        }
    ,   [router.pathname]
    );

    const hasProvider = provider() != null;
    const routes      = network() && connected() ? routesWithSigner : ( hasProvider ? routesReadOnly : [] );

    return <div className={classes.root}>
        <Link key="route-link-main" href="/">
            <a className={clsx(classes.link, classes.logo)}>
                NFT-OթͲ
            </a>
        </Link>

        { !network() && <p>{ hasProvider ? "Connect to localhost" : "Metamask required to access dapp" }</p> }

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
                className={clsx(classes.connectBtn, connected() && classes.connectBtnSmall)}
                variant="contained"
                { ... !connected() && { onClick : ( hasProvider ? connectWallet : () => window.open("https://metamask.io/download") ) } }
            >
                <p>{ connected() ? getAccountDisplayValue(account) : (hasProvider ? "Connect wallet" : "Install Metamask") }</p>
            </Button>
        </div>
    </div>;
}

export default Header;
