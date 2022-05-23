import {AccessTime} from "@mui/icons-material";
import {Typography} from "@mui/material";
import {useEffect, useState} from "react";
import {fetchNFTDetails} from "../utils/api";
import {NFTAsset, Option, OptionWithNFTDetails} from "../utils/declarations";
import classes from "./styles/OptionListItemPreview.module.scss";

type OptionListItemPreviewProps = {
    option: Option;
    onSelectOptionForPreview: (optionWithNFTDetails: OptionWithNFTDetails | null) => void;
};

function OptionListItemPreview(props: OptionListItemPreviewProps) {
    const {option, onSelectOptionForPreview} = props;

    const [optionWithNFTDetails, setOptionWithNFTDetails] = useState<OptionWithNFTDetails | null>(null);

    const handleAddAssetToOption = (asset: NFTAsset | null) => {
        setOptionWithNFTDetails({
            id: option.id,
            buyer: option.buyer,
            flavor: option.flavor,
            strikePrice: option.strikePrice,
            state: option.state,
            interval: option.interval,
            premium: option.premium,
            seller: option.seller,
            startDate: option.startDate,
            asset: asset,
        });
    };

    useEffect(() => {
        if (!option.nftContract || !option.nftId) {
            return;
        }
        fetchNFTDetails(option.nftContract, option.nftId, handleAddAssetToOption);
    }, [option.nftContract, option.nftId]);

    if (!optionWithNFTDetails?.asset) {
        return null;
    }

    return (
        <div className={classes.card} onClick={onSelectOptionForPreview.bind(null, optionWithNFTDetails)}>
            <img style={{backgroundImage: `url(${optionWithNFTDetails.asset.image})`}} alt="" />
            <div className={classes.content}>
                <Typography className={classes.title}>{optionWithNFTDetails.asset.name}</Typography>
                <div className={classes.moreInfoContainer}>
                    <Typography>{optionWithNFTDetails.strikePrice} ETH</Typography>
                    <Typography>
                        <AccessTime />
                        {new Date(optionWithNFTDetails.interval).toLocaleDateString()}
                    </Typography>
                </div>
            </div>
        </div>
    );
}

export default OptionListItemPreview;
