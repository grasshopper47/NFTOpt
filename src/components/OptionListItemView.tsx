import { AccessTime } from "@mui/icons-material";
import { ethers } from "ethers";
import { getCorrectPlural } from "../utils/frontend";
import { OptionWithAsset } from "../utils/types";
import classes from "./styles/OptionListItemView.module.scss";

type OptionListItemViewProps =
{
    option: OptionWithAsset;
    onViewOptionDetails: (OptionWithAsset: OptionWithAsset | null) => void;
};

function OptionListItemView(props: OptionListItemViewProps)
{
    const { option, onViewOptionDetails } = props;

    return (
        // TODO overlay
        <div className={classes.card} onClick={onViewOptionDetails.bind(null, option)}>
            <img style={{ backgroundImage: `url(${option.asset.image})` }} alt="" />
            <div className={classes.content}>
                <p className={classes.title}>#{option.id + 1}</p>
                <p className={classes.title}>{option.asset.name}</p>
                <div className={classes.moreInfoContainer}>
                    <p>{ethers.utils.formatEther(option.strikePrice)} ETH</p>
                    <p>
                        <AccessTime />
                        <span>
                            {option.interval} {getCorrectPlural("day", option.interval)}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default OptionListItemView;