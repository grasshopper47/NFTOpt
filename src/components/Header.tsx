import React from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import classes from "./styles/Header.module.scss";
import clsx from "clsx";

type Route = {
    href: string;
    name: string;
};

const routes: Route[] = [
    {
        href: "/create-option",
        name: "Create option",
    },
    {
        href: "/explore-options",
        name: "Explore options",
    },
    {
        href: "/my-options",
        name: "My options",
    },
];

function Header() {
    const router = useRouter();

    console.log(classes.link);

    return (
        <div className={classes.root}>
            <Link key="route-link-main" href="/">
                <a className={clsx(classes.link, classes.logo)}>NFTopt</a>
            </Link>
            <div>
                {routes.map((route) => (
                    <Link key={`route-link-${route.href}`} href={route.href}>
                        <a className={clsx(classes.link, router.pathname == route.href && classes.active)}>{route.name}</a>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default Header;
