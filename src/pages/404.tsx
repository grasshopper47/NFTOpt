// @ts-ignore
import classes from "../styles/pages/404.module.scss";

import {Button} from "@mui/material";
import {useRouter} from "next/router";

function NotFound()
{
    const router = useRouter();

    const handleNavigateToHome = () => router.push("/");

    return (
        <div className={classes.root}>
            <p>Landed in uncharted waters</p>
            <Button variant="contained" className={classes.btn} onClick={handleNavigateToHome}>
                Home
            </Button>
        </div>
    );
}

export default NotFound;