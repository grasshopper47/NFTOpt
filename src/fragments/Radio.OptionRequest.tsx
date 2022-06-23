
// @ts-ignore
import classes from "../styles/components/OptionRequestForm.module.scss";

import { OptionFlavor } from "../utils/types";
import { FormControlLabel, Radio } from "@mui/material";
import { flavorLabels } from "../utils/frontend";

type Props =
{
    flavor    : OptionFlavor
,   onChange ?: any
};

export default function(props: Props)
{
    let name = flavorLabels[props.flavor];

    return <>
        <FormControlLabel
            key={`radio-${name}`}
            label={name}
            value={props.flavor}
            control={<Radio />}
            onChange={props.onChange}
        />
    </>;
}