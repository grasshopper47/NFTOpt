import React from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import classes from "./styles/Header.module.scss";
import clsx from "clsx";
import Button from "@mui/material/Button";
import ThemeSwitch from "./ThemeSwitch";
import {getAccountDisplayValue} from "../utils/frontend";

type Route = {
    href: string;
    name: string;
};

const routes: Route[] = [
    {
        href: "/publish-option-request",
        name: "Publish Option",
    },
    {
        href: "/explore-options",
        name: "Explore Options",
    },
    {
        href: "/my-options",
        name: "My Options",
    },
    {
        href: "/team",
        name: "Team™",
    },
];

type HeaderProps = {
    account: string;
    onConnectAccount: () => void;
};

function Header(props: HeaderProps) {
    const {account, onConnectAccount} = props;

    const router = useRouter();

    return (
        <div className={classes.root}>
            <Link key="route-link-main" href="/">
                <a className={clsx(classes.link, classes.logo)}>NFT-OթͲ</a>
            </Link>
            <div>
                {account
                    ? routes.map((route) => (
                          <Link key={`route-link-${route.href}`} href={route.href}>
                              <a className={clsx(classes.link, router.pathname == route.href && classes.active)}>
                                  {route.name}
                              </a>
                          </Link>
                      ))
                    : null}
                <ThemeSwitch />
                <Button
                    className={clsx(classes.connectBtn, account && classes.connectBtnSmall)}
                    variant="contained"
                    onClick={onConnectAccount}
                >
                    <p>{account ? getAccountDisplayValue(account) : "Connect wallet"}</p>
                </Button>
            </div>
        </div>
    );
}

export default Header;
