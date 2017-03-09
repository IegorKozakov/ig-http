'use strict';

const fs = require('fs');
const Path = require('path');
const Types = require('./contenttypes.json');

class Listeners {

    constructor(options){
        this.options = options;
    };

    onRequest(conn, data){
        let response = this.getHeaders(data.toString('utf-8')),
            path = this.options.rootDir+response.url;

        this.checkFileInPath(path).then(file => {
            response.code = 200;
            response.body = file;
            response.headers['Content-Type'] = this.getContentType(path);

            this.sendData(conn, response);

        }).catch(err => {
            let code = err.errno;

            switch(code) {
                case -2:
                    response.code = 404;
                    response.body = '404 error. No such file or directory.';
                    break;
                case -13:
                    response.code = 400;
                    response.body = '400 error. No permissions to open file or directory.';
                    break;
            }

            this.sendData(conn, response);
        });
    };


    getHeaders(data){
        let request = {};

        request.headers = {};

        data.split('\r\n').forEach((item, i)=> {
            let head = item.split(':');

            if(i === 0) {
                let requestData = item.split(' ');

                request.method = requestData[0];
                request.url = requestData[1];
                request.version = requestData[2];
            } else if(head[0]) {
                request.headers[head[0]] = head[1];
            }
        });

        return request;
    };

    getContentType(path){
        let name = Path.basename(path),
            ext = Path.extname(name).substr(1);

        return Types[ext]
    }

    checkFileInPath(path){
        return new Promise((resolve, reject) => {
            fs.access(path, fs.constants.R_OK, (err) => {
                if(err) {
                    reject(err);
                } else {
                    fs.readFile(path, (err, file) =>{
                        if(err){
                            reject(err);
                        } else {
                            resolve(file);
                        }
                    });
                }
            });
        });
    };

    sendData(conn, res) {
        conn.write(`${res.version} ${res.code}\r\n`);

        for(let key in res.headers) {
            conn.write(`${key}: ${res.headers[key]}\r\n`);
        }

        conn.write('\r\n');

        conn.end(res.body);
    };
}

module.exports = Listeners;