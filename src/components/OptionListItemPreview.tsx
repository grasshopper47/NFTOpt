import { AccessTime } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { OptionWithNFTDetails } from "../utils/declarations";
import classes from "./styles/OptionListItemPreview.module.scss";

type OptionListItemPreviewProps = {
    option: OptionWithNFTDetails;
    onSelectOptionForPreview: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

function OptionListItemPreview(props: OptionListItemPreviewProps) {
    const { option, onSelectOptionForPreview } = props;

    return (
        <div className={classes.card} onClick={onSelectOptionForPreview.bind(null, option)}>
            <img style={{ backgroundImage: `url(${option.asset.image})` }} alt="" />
            <div className={classes.content}>
                <Typography className={classes.title}>{option.asset.name}</Typography>
                <div className={classes.moreInfoContainer}>
                    <Typography>{option.strikePrice} ETH</Typography>
                    <Typography>
                        <AccessTime />
                        <span>{option.interval} days</span>
                    </Typography>
                </div>
            </div>
        </div>
    );
}

export default OptionListItemPreview;
