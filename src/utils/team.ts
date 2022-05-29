type Social = {
    name: string;
    url: string;
};

export type Person = {
    name?: string;
    social?: Social[];
    image: string;
};

export const team: Person[] = [
    {
        name: "Shabab A",
        image: "shabab.jpg",
    },

    {
        name: "Stefana M",
        image: "stef.jpg",
    },

    {
        name: "Luis I",
        image: "luis.jpg",
    },

    {
        name: "Greg v. D",
        image: "greg.jpg",
    },

    {
        // name: "..  ✨ NFT-OթͲ ✨ ..",
        social: [{name: "Visit our repo", url: "https://github.com/grasshopper47/NFTOpt"}],
        image: "github2.jpg",
    },

    {
        name: "Peter A",
        image: "peter.jpg",
    },

    {
        name: "Coach - Shubham",
        image: "shubham.jpg",
    },

    {
        name: "Guide - Preethi",
        image: "preethi.jpg",
    },

    {
        name: "Coach - Rahul",
        image: "rahul.jpg",
    },
];
