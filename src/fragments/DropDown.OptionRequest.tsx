// @ts-ignore
import classes from "../styles/components/OptionRequestForm.module.scss";

import { Select, MenuItem } from "@mui/material";
import { assetsOf, keyOf } from "../utils/NFT/localhost";
import { NFTAsset, OptionRequest } from "../utils/types";
import { account } from "../utils/metamask";

type Props =
{
    request  : OptionRequest
,   setAsset : (asset: NFTAsset) => void
};

export default function(props: Props)
{
    let assets = assetsOf(account());

    return <>
        <div className={classes.fieldWrapper}>
            <Select
                MenuProps={{ classes: { paper: classes.menuPaper } }}
                value={keyOf(props.request)}
            >
                <MenuItem
                    value={"0_"}
                    onClick={props.setAsset.bind(null, null)}
                >
                    <i>Select an NFT</i>
                </MenuItem>
                <hr/>
                {
                    assets
                    ?   assets.map
                        (
                            asset =>
                            <MenuItem
                                key={keyOf(asset)}
                                value={keyOf(asset)}
                                onClick={props.setAsset.bind(null, asset)}
                            >
                                {asset.name}
                            </MenuItem>
                        )
                    :   "Loading items..."
                }
            </Select>
        </div>
    </>;
}