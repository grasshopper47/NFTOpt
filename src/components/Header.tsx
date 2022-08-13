// @ts-ignore
import classes from "./styles/Header.module.scss";
import clsx from "clsx";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAccount } from "../pages/_app";
import { connected, connectWallet, network, provider } from "../utils/metamask";
import { getAccountDisplayValue } from "../utils/helpers";
import ThemeSwitch from "../fragments/ThemeSwitch.Header";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import AdbIcon from "@mui/icons-material/Adb";
import ButtonBase from "@mui/material/ButtonBase";

import { experimentalStyled as styled } from "@mui/material/styles";

type Route = {
    href: string;
    name: string;
};

const routesReadOnly: Route[] = [
    {
        href: "/explore",
        name: "Explore",
    },
    {
        href: "/team",
        name: "Team™",
    },
];

const routesWithSigner: Route[] = [
    {
        href: "/mint",
        name: "Mint",
    },
    {
        href: "/request",
        name: "Publish",
    },
    ...routesReadOnly,
];

const Img = styled("img")({
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
});

function Header() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const router = useRouter();
    const account = useAccount();

    useEffect(() => {
        if (router.pathname !== "/explore") document.body.onclick = null;
    }, [router.pathname]);

    const hasProvider = provider() != null;
    const routes = network() && connected() ? routesWithSigner : hasProvider ? routesReadOnly : [];

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    return (
        <div className={classes.root}>
            <AppBar position="static" sx={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}>
                <Container maxWidth="lg">
                    <Toolbar disableGutters>
                        <ButtonBase sx={{ display: { xs: "none", md: "flex" }, mr: 1 }}>
                            <Link key="route-link-main" href="/">
                                <a className={clsx(classes.link, classes.logo)}>NFT-OթͲ</a>
                            </Link>
                        </ButtonBase>

                        {!network() && (
                            <Typography variant="body1" color="red">
                                {hasProvider ? "Connect to localhost" : "Metamask required to access dapp"}
                            </Typography>
                        )}

                        <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
                            <IconButton
                                size="large"
                                aria-label="account of current user"
                                aria-controls="menu-appbar"
                                aria-haspopup="true"
                                onClick={handleOpenNavMenu}
                                color="success"
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                id="menu-appbar"
                                anchorEl={anchorElNav}
                                anchorOrigin={{
                                    vertical: "bottom",
                                    horizontal: "left",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "left",
                                }}
                                open={Boolean(anchorElNav)}
                                onClose={handleCloseNavMenu}
                                sx={{
                                    display: { xs: "block", md: "none" },
                                }}
                            >
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

                        <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
                            {routes.map((route) => (
                                <Button key={route.href} onClick={handleCloseNavMenu} sx={{ my: 2, color: "white", display: "block" }}>
                                    <Link key={`route-link-${route.href}`} href={route.href}>
                                        <a className={clsx(classes.link, router.pathname == route.href && classes.active)}>{route.name}</a>
                                    </Link>
                                </Button>
                            ))}
                            <ThemeSwitch />
                            <Button
                                className={clsx(classes.connectBtn, connected() && classes.connectBtnSmall)}
                                variant="outlined"
                                sx={{ my: 2, color: "white", display: "block" }}
                                {...(!connected() && {
                                    onClick: hasProvider ? connectWallet : () => window.open("https://metamask.io/download"),
                                })}
                            >
                                <Typography variant="h5" component="span" color="black">
                                    {connected() ? getAccountDisplayValue(account) : hasProvider ? "Connect wallet" : "Install Metamask"}
                                </Typography>
                            </Button>
                        </Box>
                    </Toolbar>
                </Container>
            </AppBar>
        </div>
    );
}
export default Header;
