// @ts-ignore
import classes from "../components/styles/ThemeSwitch.module.scss";

import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";

type ThemeState = "white" | "dark";

function ThemeSwitch()
{
    const [themeState, setThemeState] = useState<ThemeState>("white");

    useEffect
    (
        () =>
        {
            const theme: ThemeState = (localStorage.theme as ThemeState) ?? "white";

            setThemeState(theme);

            document.documentElement.setAttribute("data-theme", theme);
        }
    ,   []
    );

    const handleThemeChanged = () =>
    {
        let theme: ThemeState = themeState === "white" ? "dark" : "white";

        setThemeState(theme);

        localStorage.theme = theme;

        document.documentElement.setAttribute("data-theme", theme);
    };

    return <>
        <IconButton onClick={handleThemeChanged} className={classes.button}>
            { themeState === "white" ? "☀" : "🌒" }
        </IconButton>
    </>;
}

export default ThemeSwitch;