import { BigNumber } from "ethers";

const _networks : any =
{
    "1"     : "mainnet"
,   "4"     : "rinkeby"
,   "31337" : "localhost"
};

const _network_id: string = process.env.NEXT_PUBLIC_NETWORK_ID || "31337";

export const floatNumberRegex = /^([0-9]*[.])?[0-9]*$/;

export const ADDRESS0: string = "0x0000000000000000000000000000000000000000";
export const BIGNUMBER0 : BigNumber = BigNumber.from(0);
export const NETWORK_NAME: string = _networks[_network_id];
export const SECONDS_IN_A_DAY = 86400;
export const TOAST_DURATION = 2000;
export const TOAST_DELAY = 333;
export const MAX_MINTABLE_TOKENS = 5;

export const ABIs =
{
    ERC721:
    {
        name:
        {
            name: "name",
            stateMutability: "view",
            type: "function",
            inputs: [],
            outputs:
            [
                {
                    internalType: "string",
                    name: "",
                    type: "string"
                }
            ]
        },

        ownerOf:
        {
            name: "ownerOf",
            stateMutability: "view",
            type: "function",
            inputs:
            [
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            outputs:
            [
                {
                    internalType: "address",
                    name: "",
                    type: "address",
                },
            ]
        },

        approve:
        {
            name: "approve",
            stateMutability: "nonpayable",
            type: "function",
            inputs:
            [
                {
                    internalType: "address",
                    name: "to",
                    type: "address",
                },
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            outputs: []
        },

        getApproved:
        {
            name: "getApproved",
            stateMutability: "view",
            type: "function",
            inputs:
            [
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            outputs:
            [
                {
                    internalType: "address",
                    name: "",
                    type: "address",
                },
            ],
        },

        tokenURI:
        {
            name: "tokenURI",
            stateMutability: "view",
            type: "function",
            inputs:
            [
                {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256",
                },
            ],
            outputs:
            [
                {
                    internalType: "string",
                    name: "",
                    type: "string",
                },
            ],
        },

        Events:
        {
            Approval:
            {
                name: "Approval",
                type: "event",
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: "address",
                        name: "owner",
                        type: "address",
                    },
                    {
                        indexed: true,
                        internalType: "address",
                        name: "approved",
                        type: "address",
                    },
                    {
                        indexed: true,
                        internalType: "uint256",
                        name: "tokenId",
                        type: "uint256",
                    },
                ],
            }
        },
    }
};