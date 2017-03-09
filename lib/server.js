'use strict';

const net = require('net');
const Listeners = require('./listeners');

class IG_HTTP {

    constructor(options) {
        this.server = null;
        this.options = options;
        this.port = options.port || process.env.PORT || 3000;

        if(!options.rootDir){
            throw new Error('set rootDir parameter!!!');
        }

        this.rootDir = options.rootDir
    };

    start() {
        let listeners = new Listeners(this.options);

        this.server = net.createServer(conn => {
            conn.on('data', data => {
                listeners.onRequest(conn, data);
            });
        });

        if(this.options.debug) console.log(`server starts on ${this.port}`);

        this.server.listen(this.port);
    };
}

module.exports = IG_HTTP;