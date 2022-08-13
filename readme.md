[![CI/CD](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml/badge.svg?branch=main)](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml)

<br>
<br>

## PREPARATION AND DEPENDENCIES<br>

**_Prepare_** the project

`npm install`<br>

<br>

**_Clone and build Graph (GRT)_** for local deployment<br>

Consult the [readme](https://github.com/graphprotocol/graph-node/blob/master/README.md) of [graph-node](https://github.com/graphprotocol/graph-node) GitHub &emsp; ⚠️ _store the cloned **graph-node** source one level above **this project**'s source_ ⚠️<br>

<br>

**_Generate_** the types used throughout the project

`npm run clean`<br>
`npm run compile`<br>

<br>

**_Run tests_** through HardHat (optional)

`npm run tests`<br>

<br>

## SMART CONTRACTS<br>

**_Start hardhat-ganache node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start blockchain"`

This will open a new console session with a live ETH node under HardHat management<br>

Closing the console will terminate the process<br>

<br>

**_Publish smart contracts_** on local blockchain node

`npm run "solidity publish all"`

When successful this task generates the following files:<br>

&emsp;Addresses of contracts deployed by `scripts/publish/all.ts` are outputted in `./addresses.json`<br>

&emsp;Graph generator JSON files are outputted in `./graphs/{name}/config.JSON`<br>

<br>

## SUBGRAPHS<br>

**_Start ipfs node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start ipfs"`<br>

<br>

**_Start graph node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start ipfs"`<br>

<br>

**_Create and publish graph indexer nodes_** on local graph node

`npm run "graph create nodes"`<br>
`npm run "graph generate all"`<br>
`npm run "graph publish all"`<br>

<br>

## FRONTEND<br>

**_Setup Metamask_** with the locally-deployed node and import accounts

Step 1:<br>
&emsp;Go to the console/terminal window where Ganache was previously deployed<br>
&emsp;Note down the private keys for account #0 and account #1<br>
&emsp;Import them in Metamask<br>
<br>
Step 2:<br>
&emsp;Check that the local node running at `http://127.0.0.1:8545` is visible in Metamask via _Networks_ tab in _Settings_<br>
&emsp;You may need to edit the chain ID of this network to be **31337** (elite = eleet = 31337)<br>
<br>

**_Start react-next frontend node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start webserver"`

You can edit the React components and work on other front-end related code without rebuilding, as it auto-refreshes on save<br>
<br>

## POST SETUP<br>

After completing **all** of the operations described above, you should be able to access `http://localhost:3003` and connect Metamask<br>

Notice a new tab labeled **Mint** in the header menu; click it<br>

In the new page, select an NFT collection from the dropdown of collections, then click the "Mint" button to create an NFT for the connected account and confirm the transaction<br>

Once it completes you will be able to publish a request for option via the **Publish** tab in the header menu<br>
<br>
<br>

## PORT LIST<br>

3003 : react-next     <br>
5002 : ipfs           <br>
5432 : postgres       <br>
8000 : graphiQL       <br>
8020 : graph-indexer  <br>
8545 : ganache/hardhat<br>
