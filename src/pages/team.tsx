// @ts-ignore
import classes from "./styles/team.module.scss";

import React from "react";
import Image from "next/image";
import { team } from "../../datasources/team";
import Layout from "../fragments/Layout";

import { experimentalStyled as styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

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

function TeamPage() {
    return (
        <Layout>
            {/* <div className={classes.root}>
                {team.map((member, i) => (
                    <div key={`member-card-${i}`} className={classes.card}>
                        <Image src={`/images/${member.image}`} alt={member.name} width={70} height={74} layout="responsive" />
                        <div className={classes.content}>
                            {member.name ? <div className={classes.title}>{member.name}</div> : null}
                            {member.social?.map(({ name, url }, j) => (
                                <div key={`social-${i}-${j}`} className={classes.social}>
                                    <a href={url} target="_blank">
                                        {name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div> */}

            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
                    {team.map((member, i) => (
                        <Grid item key={`member-card-${i}`} xs={4} sm={2} md={2}>
                            <Item>
                                <ButtonBase sx={{ width: 70, height: 70 }}>
                                    <Img src={`/images/${member.image}`} alt={member.name} />
                                </ButtonBase>
                                <Typography gutterBottom variant="subtitle1" component="div">
                                    {member.name ? member.name : null}
                                </Typography>
                                {member.social?.map(({ name, url }, j) => (
                                    <div key={`social-${i}-${j}`} className={classes.social}>
                                        <a href={url} target="_blank">
                                            {name}
                                        </a>
                                    </div>
                                ))}
                            </Item>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Layout>
    );
}

export default TeamPage;
