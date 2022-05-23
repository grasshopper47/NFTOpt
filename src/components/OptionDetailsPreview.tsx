import {ArrowBackIosRounded} from "@mui/icons-material";
import {IconButton} from "@mui/material";
import {NFTAsset, OptionWithNFTDetails} from "../utils/declarations";
import classes from "./styles/OptionDetailsPreview.module.scss";

type OptionDetailsPreviewProps = {
    option: OptionWithNFTDetails;
    onSelectOption: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

function OptionDetailsPreview(props: OptionDetailsPreviewProps) {
    const {option, onSelectOption} = props;

    return (
        <div>
            <IconButton onClick={onSelectOption.bind(null, null)} className={classes.goBackBtn}>
                <ArrowBackIosRounded />
            </IconButton>
            Option details preview {option.id}
        </div>
    );
}

export default OptionDetailsPreview;
