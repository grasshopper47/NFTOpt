// @ts-ignore
import classes from "../components/styles/OptionDetailsView.module.scss";

import { getAccountDisplayValue } from "../utils/helpers";
import { scanner } from "../utils/metamask";

type Props =
{
    label : string
,   value : string
};

export default function(props: Props)
{
    return <>
        <div className={classes.field}>
            <span>{props.label}</span>
            <a  target="_blank"
                href={`${scanner()}/address/${props.value}`}
            >
                {getAccountDisplayValue(props.value)}
            </a>
            <span>{}</span>
        </div>
    </>;
}