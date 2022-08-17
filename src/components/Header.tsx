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

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import ButtonBase from "@mui/material/ButtonBase";


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
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);


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

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) =>
    {
        setAnchorElNav(event.currentTarget);
    };


    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) =>
    {
        setAnchorElUser(event.currentTarget);
    };


    const handleCloseNavMenu = () =>
    {
        setAnchorElNav(null);
    };

    return <div className={classes.root}>
        <AppBar position="static" className={classes.appBar}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>

                    <ButtonBase sx={{
                        display: { xs: "none", md: "flex" }, mr: 1
                        }}>
                    <Link key="route-link-main" href="/">
                        <a className={clsx(classes.link, classes.logo)}>
                            NFT-OթͲ
                        </a>
                    </Link>
                </ButtonBase>

                { !network && <p>{ hasProvider ? "Connect to localhost" : "Metamask required to access dapp" }</p> }

                <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                            <IconButton size="large" aria-label="account of current user" aria-controls="menu-appbar" aria-haspopup="true" onClick={handleOpenNavMenu}color="success">
                                <MenuIcon />
                            </IconButton>
                            <Menu id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                            keepMounted
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                                }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: "block", md: "none" }}}>
                                {routes.map((route) => (
                                    <MenuItem key={route.href} onClick={handleCloseNavMenu}>
                                        <Link href={route.href}>
                                            <a className={clsx(classes.link, router.pathname == route.href && classes.active)}>
                                                {route.name}
                                            </a>
                                        </Link>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                        <ButtonBase sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
                            <Link key="route-link-main" href="/">
                                <a className={clsx(classes.link, classes.logo)}>NFT-OթͲ</a>
                            </Link>
                        </ButtonBase>
                        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, alignItems: "center", justifyContent: "center" }}>
                        {
                            routes.map
                            (
                                route =>
                                <Link
                                    key={`route-link-${route.href}`}
                                    href={route.href}
                                    onClick={handleCloseNavMenu}>
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
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    </div>;
}

export default Header;
