'use strict';

const net = require('net');
const port = process.env.PORT || 3000;
const fs = require('fs');

const server = net.createServer(conn => {
    let hashmap;
    let path;

    conn.on('data', data => {
        let parced = data.toString('utf-8');
        hashmap = getHeaders(parced);

        if(hashmap.path !== '/'){
            checkAcess(hashmap.path).then(access => {
                console.log(access);
                fs.readFile(hashmap.path, (err, file) => {
                    conn.end(file);
                    console.log(err);
                    console.log(file);
                });
            }).catch(err => {
                console.log('400 error', err);
            })
        }
    });
});

function getHeaders (request) {
    let headers = {};

    request.split('\r\n').forEach((item, i)=> {
        let head = item.split(':');

        if(i === 0) {
            let requestData = item.split(' ');
            headers.method = requestData[0];
            headers.path = __dirname+requestData[1];
        } else if(head[0]) {
            headers[head[0]] = head[1];
        }
    });



    return headers;
}

function checkAcess(path){

    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.R_OK, (err) => {
            if(err) {
                reject('no access!');
            } else {
                resolve('can read');
            }
        });
    });
}



console.log(`start server on por: ${port}`);
server.listen(port);