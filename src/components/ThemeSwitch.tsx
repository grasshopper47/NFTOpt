import {useState} from "react";
import {IconButton} from "@mui/material";
import Sun from "@mui/icons-material/WbSunnyRounded";
import Moon from "@mui/icons-material/Brightness3Rounded";
import classes from "./styles/ThemeSwitch.module.scss";

type ThemeState = "white" | "dark";

function ThemeSwitch() {
    const [themeState, setThemeState] = useState<ThemeState>(
        /* (localStorage.getItem("theme") as ThemeState) ??  */ "white"
    );

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
