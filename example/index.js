'use strict';

const ig_http = require('../index');

let serverConfig = {
    port: 3010,
    rootDir: __dirname,
    debug: true
};

let server = new ig_http(serverConfig);

server.start();

