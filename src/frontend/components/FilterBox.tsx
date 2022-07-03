// @ts-ignore
import classes from "./styles/FilterBox.module.scss";
import clsx from "clsx";

import { getFloatString, getIntervalString } from "../utils/helpers";
import Row_FilterBox from "../fragments/Row.FilterBox";
import { Button, FormControlLabel, Switch } from "@mui/material";

export let filterParams = { } as FilterParams;

type FilterParams =
{
    showAll     : boolean
,   premium     : { min : string, max: string }
,   strikePrice : { min : string, max: string }
,   interval    : { min : string, max: string }
}

const resetFilterParams = () =>
{
    filterParams.showAll     = true;
    filterParams.premium     = { min: "", max: "" };
    filterParams.strikePrice = { min: "", max: "" };
    filterParams.interval    = { min: "", max: "" };
}

resetFilterParams();

type Props =
{
    onChange : () => void
};

function FilterBox(props : Props)
{
    return <>
        <div className={classes.containerRoot} onClick={(e) => e.stopPropagation()}>
            <div className={classes.root}>
                <Button
                    className={classes.btnReset}
                    onClick={ () => { resetFilterParams(); props.onChange(); } }
                >🧹</Button>

                <FormControlLabel
                    className={clsx(classes.checkbox, filterParams.showAll ? classes.checked : classes.unchecked)}
                    control={<Switch checked={!filterParams.showAll} onChange={ () => { filterParams.showAll = !filterParams.showAll; props.onChange(); } } />}
                    label={(filterParams.showAll ? "All" : "Account's") + " Options"}
                    labelPlacement="start"
                />

                <Row_FilterBox
                    onChange={props.onChange}
                    onValidate={getFloatString}
                    value={filterParams.premium}
                    label="Premium" />
                <Row_FilterBox
                    onChange={props.onChange}
                    onValidate={getFloatString}
                    value={filterParams.strikePrice}
                    label="Strike Price" />
                <Row_FilterBox
                    onChange={props.onChange}
                    onValidate={getIntervalString}
                    value={filterParams.interval}
                    label="Interval" />
            </div>
        </div>
    </>;
}

export default FilterBox;