type Social = {
    name: string;
    url: string;
};

export type Person = {
    name: string;
    social: Social[];
    image: string;
};

export const team: Person[] = [

    // TODO: cleanup dummy data after everybody commits their info
    {
        name: "Shabab A",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "shabab.jpg",
    },

    {
        name: "Stefana M",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "stef.jpg",
    },

    {
        name: "Luis I",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "luis.jpg",
    },

    {
        name: "Greg v. D",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "greg.jpg",
    },

    {
        name: "✨ TEAM NFT-OPT",
        social: [],
        image: "placeholder.jpg"
    },

    {
        name: "Peter A",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "peter.jpg",
    },

    {
        name: "Coach - Shubham",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "shubham.jpg",
    },

    {
        name: "Guide - Preethi",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "preethi.jpg",
    },

    {
        name: "Coach - Rahul",
        social: [{ name: "Your social ref here", url: "Your social url here" }],
        image: "rahul.jpg",
    },
];
