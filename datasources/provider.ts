import { ethers } from "ethers";

export let provider : ethers.providers.Web3Provider;

export const setProvider = (provider_ : ethers.providers.Web3Provider) => provider = provider_;
