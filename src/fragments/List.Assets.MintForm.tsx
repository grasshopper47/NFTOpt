// @ts-ignore
import classes from "../components/styles/MintForm.module.scss";

import React from "react";
import { NFTAsset } from "../../models/NFTAsset";
import { listItemInfo } from "../utils/loading";
import { List, ListSubheader, ListItem, ListItemAvatar, Avatar, ListItemText } from "@mui/material";

type Props =
{
    items   ?: NFTAsset[]
,   onChange : (image : string) => void
};

export default function(props : Props)
{
    return <List
        className={classes.list}
        subheader={<ListSubheader>My assets</ListSubheader>}
    >
        {
            props.items
            ?   props.items[0]
                ?   props.items.map
                    (
                        (item, i) =>
                        <ListItem
                            key={i}
                            sx={ { cursor: "pointer" } }
                            onClick={ () => props.onChange(item.image) }
                        >
                            <ListItemAvatar>
                                <Avatar>
                                    <img src={item.image} alt="NFT image data"/>
                                </Avatar>
                            </ListItemAvatar>

                            <ListItemText primary={item.name} />
                        </ListItem>
                    )
                    :   listItemInfo("Assets missing")
                :   listItemInfo("Loading assets...")
        }
    </List>
}