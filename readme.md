[![CI/CD](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml/badge.svg?branch=main)](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml)
<br>
<br>

# Contents
1. [PREPARATION](#preparation)
2. [SMART CONTRACTS](#smart-contracts)
3. [SUBGRAPHS](#subgraphs)
4. [FRONTEND](#frontend)
5. [TUTORIAL](#tutorial)

<br>
<br>

## PREPARATION<br>
<br>

**_Update and source dependecies_** using [nodejs](https://nodejs.org/en/download/)

`npm install`<br>

<br>

**_Generate_** the types used throughout the project

`npm run clean`<br>
`npm run compile`<br>

<br>

**_Run tests_** through HardHat (optional)

`npm run tests`<br>

<br>

## SMART CONTRACTS<br>

<br>

**_Start Hardhat blockchain node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start blockchain"`

A live ETH (Ganache) node under HardHat management; closing the console will require smart contracts to be re-published<br>

<br>

**_Publish smart contracts_** on local blockchain node

`npm run "solidity publish all"`

When successful, this task generates the following files:<br>

- addresses of contracts deployed by `scripts/publish/all.ts` are outputted in `./addresses.json`<br>
- Graph generator JSON files are outputted in `./graphs/{name}/config.JSON`<br>

<br>

## SUBGRAPHS<br>

<br>

_These steps are optional, as the app can work without a Graph node, albeit with reduced functionality_<br>
<br>

**_Clone and build Graph (GRT)_** for local deployment<br>

Consult the [README](https://github.com/graphprotocol/graph-node/blob/master/README.md) of [graph-node](https://github.com/graphprotocol/graph-node) GitHub repo<br>
⚠️ Store cloned _graph-node_ repo **one level above** ( `../` ) _this_ project's location on disk ⚠️<br>

<br>

**_Start ipfs node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start ipfs"`<br>

<br>

**_Start graph node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start graph"`<br>

<br>

**_Create and publish indexer nodes_** on local graph node

`npm run "graph generate all"`<br>
`npm run "graph publish all"`<br>

<br>

## FRONTEND<br>

<br>

**_Setup Metamask_** with the locally-deployed node and import accounts

Step 1:<br>
&emsp;Go to the console/terminal window where the Hardhat blockchain node was previously deployed<br>
&emsp;Import the private keys for account **#0** (_buyer_) and account **#1** (_seller_) in Metamask<br>
<br>
Step 2:<br>
&emsp;Check that the local node running at `http://127.0.0.1:8545` is visible in Metamask via _Networks_ tab in _Settings_<br>
&emsp;You may need to edit the chain ID of this network to be **31337** (elite = eleet = 31337)<br>
<br>

**_Start react-next frontend node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start webserver"`

React components ( `.jsx` files ) can be edited and viewed without rebuilding, as `react-next` auto-refreshes the view on save<br>

<br>

## TUTORIAL<br>

After completing **all** of the operations described above, you should be able to access `http://localhost:3003` and connect Metamask using account #0 (_buyer_) imported earlier, as it has 1000 ETH in its wallet<br>

![image](https://user-images.githubusercontent.com/49437873/184709191-b0d1dd76-ea81-46a5-b067-01b3ab8359b9.png)<br>

Notice a new tab labeled **Mint** in the header menu; click it<br>
![image](https://user-images.githubusercontent.com/49437873/184709351-5afb5a5f-5f39-43b0-b6bd-7a7f34525ef2.png)<br>

In the new page, select an NFT collection from the dropdown of collections<br>
![image](https://user-images.githubusercontent.com/49437873/184709462-d0a67d22-ef35-4fd0-9eb2-ff13b8fdd7a6.png)<br>

Click ![the "Mint" button](https://user-images.githubusercontent.com/49437873/184710060-bccea028-6b10-4992-821f-b80feb30ad94.png)
 to create an NFT for the connected account and confirm the transaction<br>
 <br>
Once it completes you will be able to publish a request for option via the **Publish** tab in the header menu<br>
![image](https://user-images.githubusercontent.com/49437873/184709585-74a8fe23-cc5c-48a2-8b70-072f890af908.png)<br>

<br>
<br>

## PORT LIST<br>

3003 : react-next     <br>
5002 : ipfs           <br>
5432 : postgres       <br>
8000 : graphiQL       <br>
8020 : graph-indexer  <br>
8545 : ganache/hardhat<br>
