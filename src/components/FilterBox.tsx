// @ts-ignore
import classes from "./styles/FilterBox.module.scss";
import clsx from "clsx";

import React, { useState } from "react";
import { filterParams, resetFilterParams } from "../../datasources/filtering";
import { connected } from "../utils/metamask";
import { getFloatString, getIntervalString } from "../utils/helpers";
import { useAccount } from "../utils/contexts";
import Row_FilterBox from "../fragments/Row.FilterBox";
import { Button, FormControlLabel, Switch } from "@mui/material";

resetFilterParams();

type Props =
{
    onFilter : () => void
};

function FilterBox(props : Props)
{
    const [ showAll , setShowAll ] = useState(filterParams.account === "");

    const account = useAccount();

    return <div
        className={classes.containerRoot}
        onClick={ (e) => e.stopPropagation() }
    >
        <div className={classes.root}>
            <div className={classes.buttons}>
                {
                    connected &&
                    <FormControlLabel
                        className={clsx(classes.checkbox, showAll ? classes.checked : classes.unchecked)}
                        control=
                        {
                            <Switch
                                checked={!showAll}
                                onChange=
                                {
                                    () =>
                                    {
                                        if (!showAll) filterParams.account = "";
                                        else filterParams.account = account;

                                        setShowAll(v => !v);
                                        props.onFilter(); }
                                }
                            />
                        }
                        label={ (showAll ? "All" : "Account's") + " Options" }
                        labelPlacement="end"
                    />
                }
                <Button
                    className={classes.btnReset}
                    onClick={ () => { resetFilterParams(); props.onFilter(); } }
                >🧹</Button>
            </div>

            <Row_FilterBox
                onFilter={props.onFilter}
                onValidate={getFloatString}
                value={filterParams.premium}
                label="Premium" />

            <Row_FilterBox
                onFilter={props.onFilter}
                onValidate={getFloatString}
                value={filterParams.strikePrice}
                label="Strike Price" />

            <Row_FilterBox
                onFilter={props.onFilter}
                onValidate={getIntervalString}
                value={filterParams.interval}
                label="Interval" />
        </div>
    </div>;
}

export default FilterBox;
