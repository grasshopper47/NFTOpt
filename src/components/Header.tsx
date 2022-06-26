// @ts-ignore
import classes from "../styles/components/Header.module.scss";

import React from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import clsx from "clsx";
import Button from "@mui/material/Button";
import ThemeSwitch from "../fragments/ThemeSwitch.Header";
import { useAccount } from "../pages/_app";
import { connected, connectWallet, network } from "../utils/metamask";
import { getAccountDisplayValue } from "../utils/frontend/helpers";

type Route =
{
    href: string
,   name: string
};

const routes: Route[] =
[
    {
        href: "/request-option"
    ,   name: "Publish Option"
    }
,   {
        href: "/explore-options"
    ,   name: "Explore Options"
    }
,   {
        href: "/team"
    ,   name: "Team™"
    }
];

function Header()
{
    const router = useRouter();
    const account = useAccount();

    return <>
        <div className={classes.root}>
            <Link key="route-link-main" href="/">
                <a className={clsx(classes.link, classes.logo)}>
                    NFT-OթͲ
                </a>
            </Link>

            {
                !network() &&
                <div>Connect to localhost</div>
            }

            <div>
                {
                    connected() && network() &&
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
                    { ... !connected() && { onClick : connectWallet } }
                >
                    <p>{connected() ? getAccountDisplayValue(account) : "Connect wallet"}</p>
                </Button>
            </div>
        </div>
    </>;
}

export default Header;