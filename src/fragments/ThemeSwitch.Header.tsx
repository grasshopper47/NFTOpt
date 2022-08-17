// @ts-ignore
import classes from "../components/styles/ThemeSwitch.module.scss";

import React, { useEffect, useState } from "react";
import { IconButton } from "@mui/material";

type ThemeType = "white" | "dark";

let updateTheme = (theme : ThemeType) =>
{
    document.documentElement.setAttribute("data-theme", theme);

    setTheme(theme);
}

let handleThemeChanged = () =>
{
    let themeNew = (theme === "white" ? "dark" : "white") as ThemeType;

    localStorage.theme = themeNew;

    updateTheme(themeNew);
};

let theme    : ThemeType;
let setTheme : (a : ThemeType) => void;

function ThemeSwitch()
{
    [ theme, setTheme ] = useState<ThemeType>("white");

    useEffect
    (
        () => updateTheme(localStorage["theme"] ?? "white")
    ,   []
    );

    return <IconButton
        onClick={handleThemeChanged}
        className={classes.button}
        >
            { theme[0] === "w" ? "☀" : "🌒" }
        </IconButton>;
}

export default ThemeSwitch;
