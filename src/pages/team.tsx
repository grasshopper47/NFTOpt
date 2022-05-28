import Layout from "../components/Layout";
import {team} from "../utils/team";
import classes from "./styles/Team.module.scss";
import Image from "next/image";

function TeamPage() {
    return (
        <Layout>
            <div className={classes.root}>
                {team.map((member, i) => (
                    <div key={`member-card-${i}`} className={classes.card}>
                        <Image
                            src={`/images/${member.image}`}
                            alt={member.name}
                            width={300}
                            height={200}
                            layout="responsive"
                        />
                        <div className={classes.content}>
                            <p className={classes.title}>{member.name}</p>
                            <div>
                                {member.social.map(({name, url}, j) => (
                                    <div key={`social-${i}-${j}`} className={classes.social}>
                                        <strong>{name}:</strong>
                                        <a href={url} target="_blank">
                                            {url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default TeamPage;
