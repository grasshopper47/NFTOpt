import { OptionFlavor } from "../utils/types";
import { FormControlLabel, Radio } from "@mui/material";
import { flavorLabels } from "../utils/frontend";

type Props =
{
    flavor    : OptionFlavor
,   value     : number
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
            control={<Radio checked={props.flavor === props.value} />}
            onChange={props.onChange}
        />
    </>;
}