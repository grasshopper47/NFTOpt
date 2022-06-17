// @ts-ignore
import classes from "./styles/ThemeSwitch.module.scss";

import { useEffect, useState } from "react";
import { IconButton } from "@mui/material";
import Sun from "@mui/icons-material/WbSunnyRounded";
import Moon from "@mui/icons-material/Brightness3Rounded";

type ThemeState = "white" | "dark";

function ThemeSwitch() {
    const [themeState, setThemeState] = useState<ThemeState>("white");

    useEffect(() => {
        const theme: ThemeState = (localStorage.getItem("theme") as ThemeState) ?? "white";
        setThemeState(theme);
        document.documentElement.setAttribute("data-theme", theme);
    }, []);

    const handleSwitchTheme = () => {
        let theme: ThemeState = "white";
        if (themeState !== "dark") {
            theme = "dark";
        } else {
            theme = "white";
        }
        setThemeState(theme);
        localStorage.setItem("theme", theme);
        document.documentElement.setAttribute("data-theme", theme);
    };

    return (
        <IconButton onClick={handleSwitchTheme} className={classes.button}>
            {themeState === "dark" ? <Sun className={classes.sun} /> : <Moon className={classes.moon} />}
        </IconButton>
    );
}

export default ThemeSwitch;
