import React from "react";

import { ListItem, MenuItem } from "@mui/material";

const sx =
{
    centered :
    {
        display        : "flex"
    ,   justifyContent : "center"
    }
};

export const listItemInfo = (text : string) => <ListItem disabled sx={sx.centered}>{text}</ListItem>;
export const menuItemInfo = (text : string) => <MenuItem disabled sx={sx.centered}>{text}</MenuItem>;
