import {Button} from "@mui/material";
import {useRouter} from "next/router";
import classes from "./styles/404.module.scss";

function NotFound() {
    const router = useRouter();

    const handleNavigateToHome = () => {
        router.push("/");
    };

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