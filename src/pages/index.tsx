// @ts-ignore
import classes from "./styles/index.module.scss";

import React from "react";
import Image from "next/image";
import Layout from "../fragments/Layout";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";

type PresentationCard =
{
    title       : string
,   description : string
,   image       : string
};

const presentationCards : PresentationCard[] =
[
    {
        title       : "Hedge"
    ,   description : "Create an NFT option contract on your current NFTs!"
    ,   image       : "/images/presentation-card-1.svg"
    }

,   {
        title       : "Collateralize"
    ,   description : "Secure your NFTs agains downsides!"
    ,   image       : "/images/presentation-card-2.svg"
    }

,   {
        title       : "Sell"
    ,   description : "Sell your NFTs at your desired value!"
    ,   image       : "/images/presentation-card-3.svg"
    }
];

function LandingPage() {
    return (
        <Layout>
            <Box sx={{ flexGrow: 3}}>
                <Grid container columns={{ xs: 4, sm: 8, md: 16 }} className={classes.gridContainer} >
                    {presentationCards.map((card) => (
                        <Grid item key={`presentation-card-${card.title}`} xs={4} sm={4} md={4} className={classes.card}>
                                <ButtonBase sx={{ width: 200, height: 340 }}>
                                    <img src={card.image} alt="" className={classes.cardImage}/>
                                </ButtonBase>
                                <p className={classes.title}>{card.title}</p>
                                <p className={classes.description}>{card.description}</p>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    );
}

export default LandingPage;
