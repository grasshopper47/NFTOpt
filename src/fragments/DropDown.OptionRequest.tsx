// @ts-ignore
import classes from "../styles/components/OptionRequestForm.module.scss";

import { Select, MenuItem } from "@mui/material";
import { assetsOf, keyOf, loadAssetsFor } from "../datasources/NFT/localhost";
import { NFTAsset } from "../utils/types";
import { useEffect, useState } from "react";
import { useAccount } from "../pages/_app";

type Props =
{
    value    : string
,   setAsset : (asset?: NFTAsset | null) => void
};

export default function(props: Props)
{
    const [ assets, setAssets ] = useState<NFTAsset[]>([]);
    const [ selectedValue, setSelectedValue ] = useState("0_");

    const account = useAccount();

    useEffect
    (
        () =>
        {
            setSelectedValue(props.value);

            // asset === undefined -> instruct parent to refresh
            props.setAsset();
        }
    ,   [assets, props.value]
    );

    useEffect
    (
        () =>
        {
            let assets = assetsOf(account);

            if (assets) setAssets(assets);
            else        loadAssetsFor(account).then(setAssets);
        }
    ,   [account]
    );

    const handleSelectedValueChanged = (event) => setSelectedValue(event.target.value);

    return <>
        <div className={classes.fieldWrapper}>
            <Select
                MenuProps={{ classes: { paper: classes.menuPaper } }}
                value={selectedValue}
                onChange={handleSelectedValueChanged}
            >
                <MenuItem
                    value={"0_"}
                    onClick={() => props.setAsset(null)}
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
                                onClick={() => props.setAsset(asset)}
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