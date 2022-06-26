// @ts-ignore
import classes from "../frontend/styles/pages/LandingPage.module.scss";

import Image from "next/image";
import Layout from "../components/Layout";

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
            <div className={classes.root}>
            {
                presentationCards.map
                (
                    card =>
                    <div key={`presentation-card-${card.title}`} className={classes.card}>
                        <Image src={card.image} alt="" width="200" height="380" />
                        <p className={classes.title}>{card.title}</p>
                        <p className={classes.description}>{card.description}</p>
                    </div>
                )
            }
            </div>
        </Layout>
    );
}

export default LandingPage;