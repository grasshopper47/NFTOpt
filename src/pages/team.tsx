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
                        <div>
                            <Image
                                src={`/images/${member.image}`}
                                alt={member.name}
                                width={100}
                                height={104}
                                layout="responsive"
                            />
                        </div>
                        <div className={classes.content}>
                            <div className={classes.title}>{member.name}</div>
                            {/* {member.social.map(({name, url}, j) => (
                                <div key={`social-${i}-${j}`} className={classes.social}>
                                    <strong>{name}:</strong>
                                    <br />
                                    <a href={url} target="_blank">
                                        {url}
                                    </a>
                                </div>
                            ))} */}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default TeamPage;
