# node-hefs

![Dependencies](https://img.shields.io/librariesio/release/npm/hefs?style=flat-square)
[![Downloads](https://img.shields.io/npm/dw/hefs?style=flat-square)](https://npmjs.com/package/hefs)
[![License](https://img.shields.io/github/license/Edqe14/node-hefs?style=flat-square)](https://github.com/Edqe14/node-hefs/blob/main/LICENSE)
[![GitHub issues](https://img.shields.io/github/issues/Edqe14/node-hefs?style=flat-square)](https://github.com/Edqe14/node-hefs/issues)

Hololive EN Fan Website API Wrapper for Node

## Quick start

 1. Install the package by running `npm i -S hefs`.
 2. Import the package in your project.

```typescript
// Import the package
const { Client } = require('hefs');
// or ES6 import
import { Client } from 'hefs';

const options = {
  session: 'copySessionTokenFromCookies',
  fetchSubmissionsOnStart: true, // Fetch and cache all submissions when creating new client. Default: false
}

const client = new Client(options);

client.once('ready', () => {
  // Your code
});
```

## Documentation

Available on [https://edqe14.github.io/node-hefs/](https://edqe14.github.io/node-hefs/)

## License

This project is using the [MIT License](https://github.com/Edqe14/node-hefs/blob/main/LICENSE)
