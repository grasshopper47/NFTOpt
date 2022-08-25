// @ts-ignore
import classes from "../styles/pages/team.module.scss";

import React from 'react';
import Image from "next/image";
import {team} from "../../datasources/team";
import { clsx } from "clsx";

function TeamPage() {
    return <>
        <div className={classes.root}>
            {team.slice(0,4).map((member, i) => (
                <div key={`member-card-${i}`} className={classes.card}>
                    <Image
                        src={`/images/${member.image}`}
                        alt={member.name}
                        style={{borderRadius:"6px 6px 0 0"}}
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
        <div className={clsx(classes.root, classes.cardGithub)}>
            <div className={classes.card}>
                <Image
                    src="/images/github2.jpg"
                    alt="NFTOpt"
                    style={{borderRadius:"6px 6px 0 0"}}
                    width={70}
                    height={74}
                    layout="responsive"
                />
                <div className={classes.content}>
                    <div className={classes.title}>{"..  ✨ NFT-OթͲ ✨ .."}</div>
                    <div className={classes.social}>
                        <a href={"https://github.com/grasshopper47/NFTOpt"} target="_blank">
                            Visit our repo
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <div className={classes.root}>
            {team.slice(4).map((member, i) => (
                <div key={`member-card-${i}`} className={classes.card}>
                    <Image
                        src={`/images/${member.image}`}
                        alt={member.name}
                        style={{borderRadius:"6px 6px 0 0"}}
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
    </>;
}

export default TeamPage;
