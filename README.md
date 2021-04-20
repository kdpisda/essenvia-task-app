# Run Essenvia Task React App

## Initial Setup

### Install Node and NPM

Follow [this guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install node and npm.

If you prefer `yarn` over `npm` you may install `yarn` via [this link](https://classic.yarnpkg.com/en/docs/install/)

### Setup environment variables

Rename `.env.tech` to `.env` and if you are running your `API` on different port other than `8000` then you might need to update it.

## If using `npm`

```sh
npm install
npm start
```

## If using `yarn`

```sh
yarn
yarn start
```

The react app will start and it will open in your browser window.

> In order to run the app, you must also have your [`API Server`](https://github.com/kdpisda/essenvia-task) running on the port specified in the `.env` file. Checkout the repo of [API](https://github.com/kdpisda/essenvia-task) and setup it following the `README.md` file in the repo.
