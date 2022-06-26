// @ts-ignore
import classes from "../../styles/components/ThemeSwitch.module.scss";

import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import Sun from "@mui/icons-material/WbSunnyRounded";
import Moon from "@mui/icons-material/Brightness3Rounded";

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
            { themeState === "white" ? <Moon className={classes.moon} /> : <Sun className={classes.sun} /> }
        </IconButton>
    </>;
}

export default ThemeSwitch;