// @ts-ignore
import classes from "../components/styles/OptionDetailsView.module.scss";

type Props =
{
    label : string
,   value : string
,   className? : string
};

export default function(props: Props)
{
    return <>
        <div className={classes.field}>
            <span>{props.label}</span>
            <span { ... props.className && { className: classes[props.className] } }>{props.value}</span>
        </div>
    </>;
}