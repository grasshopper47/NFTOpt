// @ts-ignore
import classes from "./styles/index.module.scss";

import React from "react";
import Image from "next/image";
import Layout from "../fragments/Layout";

import { experimentalStyled as styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";

type PresentationCard = {
    title: string;
    description: string;
    image: string;
};

const presentationCards: PresentationCard[] = [
    {
        title: "Hedge",
        description: "Create an NFT option contract on your current NFTs!",
        image: "/images/presentation-card-1.svg",
    },

    {
        title: "Collateralize",
        description: "Secure your NFTs agains downsides!",
        image: "/images/presentation-card-2.svg",
    },

    {
        title: "Sell",
        description: "Sell your NFTs at your desired value!",
        image: "/images/presentation-card-3.svg",
    },
];

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

const Img = styled("img")({
    margin: "auto",
    display: "block",
    maxWidth: "100%",
    maxHeight: "100%",
});

function LandingPage() {
    return (
        <Layout>
            {/* <div className={classes.root}>
        {presentationCards.map((card) => (
          <div key={`presentation-card-${card.title}`} className={classes.card}>
            <Image src={card.image} alt="" width="200" height="380" />
            <p className={classes.title}>{card.title}</p>
            <p className={classes.description}>{card.description}</p>
          </div>
        ))}
      </div> */}

            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {presentationCards.map((card) => (
                        <Grid item key={`presentation-card-${card.title}`} xs={4} sm={4} md={4}>
                            <Item>
                                <ButtonBase sx={{ width: 200, height: 340 }}>
                                    <Img src={card.image} alt={card.title} />
                                </ButtonBase>
                                <p className={classes.title}>{card.title}</p>
                                <p className={classes.description}>{card.description}</p>
                            </Item>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    );
}

export default LandingPage;
