// @ts-ignore
import classes from "./styles/404.module.scss";

import React from 'react';
import {Button} from "@mui/material";
import {useRouter} from "next/router";

function NotFound()
{
    const router = useRouter();

    const handleNavigateToHome = () => router.push("/");

    return <div className={classes.root}>
            <p>Landed in uncharted waters</p>

            <Button
                className={classes.btn}
                onClick={handleNavigateToHome}
                variant="contained"
            >Home</Button>
        </div>;
}

export default NotFound;
