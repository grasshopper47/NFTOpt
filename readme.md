[![CI/CD](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml/badge.svg?branch=main)](https://github.com/grasshopper47/NFTOpt/actions/workflows/ci.cd.js.yml)

<br />

**_Prepare_** the project

`npm install`

<br />
<br />

**_Generate_** the types required by TypeScript

`npm run clean && npm run compile`

<br />
<br />

**_Run tests_** through HardHat

`npm run tests`

<br />
<br />

**_Start local node_**

`npm run node`

This will open a new console session with a live ETH node under HardHat management
<br />
Closing the console will terminate the process

<br />
<br />

**_Deploy smart contracts_** on local node

`npm run deploy`

When successful, the addresses of deployed contracts by `scripts/deploy.ts` are outputted in `./addresses.json`

<br />
<br />

**_Start frontend_**

`npm run next:dev`

You can edit the React components and work on other front-end related code without rebuilding, as it auto-refreshes on save
