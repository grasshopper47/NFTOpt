// @ts-ignore
import classes from "../styles/components/FilterBox.module.scss";
import clsx from "clsx";

import React, { useState } from "react";
import { filterParams, resetFilterParams } from "../../datasources/filtering";
import { OptionFlavor } from "../../models/enums";
import { connected } from "../utils/metamask";
import { getFloatString, getIntervalString } from "../utils/helpers";
import { useAccount } from "../utils/contexts";
import { flavorLabels } from "../utils/labels";
import Row_FilterBox from "../fragments/Row.FilterBox";
import { Button, FormControlLabel, Select, SelectChangeEvent, Switch } from "@mui/material";

const handleReset = () =>
{
    resetFilterParams();

    _propsPtr.onFilter();
}

const handleFlavorChanged = (e : SelectChangeEvent) =>
{
    filterParams.flavor = parseInt(e.target.value) as OptionFlavor | -1;

    _propsPtr.onFilter();
}

let account : string;

type Props =
{
    onFilter : () => void
};

let _propsPtr : Props;

resetFilterParams();

function FilterBox(props : Props)
{
    _propsPtr = props;

    const [ showAll , setShowAll ] = useState(filterParams.account === "");

    account = useAccount();

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
                                        props.onFilter();
                                    }
                                }
                            />
                        }
                        label={ (showAll ? "All" : "Account's") + " Options" }
                        labelPlacement="end"
                    />
                }
                <Button
                    className={classes.btnReset}
                    onClick={handleReset}
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

            <Select
                native
                value={filterParams.flavor as any as string}
                className={classes.select}
                onChange={handleFlavorChanged}
            >
                <option value={-1}>Any Flavor</option>
                { flavorLabels.map( (flavor, i) => <option key={`fb-flavors-${i}`} value={i}>{flavor}</option> ) }
            </Select>
        </div>
    </div>;
}

export default FilterBox;
