[![CI/CD](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml/badge.svg?branch=main)](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml)
<br />
<br />

**_Prepare_** the project

`npm install`<br />
<br />

**_Generate_** the types required by TypeScript

`npm run clean && npm run compile`<br />
<br />

**_Run tests_** through HardHat (optional)

`npm run tests`<br />
<br />

**_Start hardhat-ganache node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start blockchain"`

This will open a new console session with a live ETH node under HardHat management<br />
Closing the console will terminate the process<br />
<br />

**_Deploy smart contracts_** on local node

`npm run "delploy all"`

When successful, the addresses of contracts deployed by `scripts/publish/all.ts` are outputted in `./addresses.json`<br />
<br />

**_Setup Metamask_** with the locally-deployed node and import accounts

Step 1:<br />
&emsp;Go to the console/terminal window where Ganache was previously deployed<br />
&emsp;Note down the private keys for account #0 and account #1<br />
&emsp;Import them in Metamask<br />
<br />
Step 2:<br />
&emsp;Check that the local node running at `http://127.0.0.1:8545` is visible in Metamask via _Networks_ tab in _Settings_<br />
&emsp;You may need to edit the chain ID of this network to be **31337** (elite = eleet = 31337)<br />
<br />

**_Start react-next frontend node_** ⚠️ _Run in a separate terminal session_ ⚠️

`npm run "start webserver"`

You can edit the React components and work on other front-end related code without rebuilding, as it auto-refreshes on save<br />
<br />
<br />
After completing **all** of the operations described above, you should be able to access `http://localhost:3003` and connect Metamask<br>
After connecting, notice a new tab on the screen labeled **Mint** and click it<br>
Select an NFT collection from the dropdown of collections, then click the "Mint" button to create an NFT for the connected account and confirm the transaction<br>
Once it completes you will be able to publish an option via the **Publish** link<br>
<br>
<br>
**_Ports used by the various server nodes employed by this app_**

3003 : react-next     <br />
5002 : ipfs           <br />
5432 : postgres       <br />
8000 : graphiQL       <br />
8020 : graph-indexer  <br />
8545 : ganache/hardhat<br />
