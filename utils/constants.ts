import { BigNumber } from "ethers";

export const ADDRESS0: string = "0x0000000000000000000000000000000000000000";
export const BIGNUMBER0 : BigNumber = BigNumber.from(0);
export const SECONDS_IN_A_DAY = 86400;
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
        }

    ,   ownerOf:
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
        }

    ,   approve:
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
        }

    ,   getApproved:
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
        }

    ,   tokenURI:
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
        }

    ,   mint:
        {
            name: "mint",
            type: "function",
            stateMutability: "",
            inputs: [],
            outputs: []
        }

    ,   transferFrom:
        {
            name: "transferFrom",
            stateMutability: "nonpayable",
            type: "function",
            inputs:
            [
                {
                    internalType: "address",
                    name: "from",
                    type: "address"
                }
            ,   {
                    internalType: "address",
                    name: "to",
                    type: "address"
                }
            ,   {
                    internalType: "uint256",
                    name: "tokenId",
                    type: "uint256"
                }
            ],
            outputs: [],
        }

    ,   Events:
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

        ,   Transfer:
            {
                name: "Transfer",
                type: "event",
                anonymous: false,
                inputs: [
                    {
                        indexed: true,
                        internalType: "address",
                        name: "from",
                        type: "address",
                    },
                    {
                        indexed: true,
                        internalType: "address",
                        name: "to",
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
        }
    }
};