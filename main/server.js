/* 
* Title: Server
* Description: Create server and export it
* Author: Md Tazri
* Date: 7/8/2021
*
*/

// dependencies
const http = require('http');
const {handleReqRes} = require('./../helpers/handleResReq')
const enviroment = require('./../helpers/enviroment');



// server object - module scaffolding
const server = {};

// configuration
server.config = {
    port: enviroment.port
};

// create server
server.createServer = ()=>{
    server.server = http.createServer(server.handleReqAndRes);
}   

// listen the server
server.listenServer = ()=>{
    if(!server.server){
        server.server = http.createServer(server.handleReqAndRes);
    }

    // listen the server
    let port = server.config.port;
    server.server.listen(port, ()=>{
        console.log("Server is runing on "+port);
        console.log("\n\n\n\n\n");
        console.log("Go to the server http://localhost:"+port);
    });
}

// handle request and response
server.handleReqAndRes = handleReqRes;

// intial the server and listen
server.init = ()=>{
    server.listenServer();
}

// export the server
module.exports = server;