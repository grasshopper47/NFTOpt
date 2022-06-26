// @ts-ignore
import classes from "../../styles/pages/Team.module.scss";

import Layout from "../frontend/components/Layout";
import {team} from "../datasources/team";
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
                            width={70}
                            height={74}
                            layout="responsive"
                        />
                        <div className={classes.content}>
                            {member.name ? <div className={classes.title}>{member.name}</div> : null}
                            {member.social?.map(({name, url}, j) => (
                                <div key={`social-${i}-${j}`} className={classes.social}>
                                    <a href={url} target="_blank">
                                        {name}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default TeamPage;
