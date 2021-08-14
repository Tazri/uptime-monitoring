/* 
* Title: Uptime Monitoring Application
* Description: A RESTFUL API to monitor up or down time of user defind links
* Author: Md Tazri
* Date: 7/8/2021
*
*/

// dependencies
const http = require('http');
const {handleReqRes} = require('./helpers/handleResReq')
const enviroment = require('./helpers/enviroment');

// app object - module scaffolding
const app = {};

// configuration
app.config = {
    port: enviroment.port
};

// create server
app.createServer = ()=>{
    app.server = http.createServer(app.handleReqAndRes);
}   

// listen the server
app.listenServer = ()=>{
    if(!app.server){
        app.server = http.createServer(app.handleReqAndRes);
    }

    // listen the server
    let port = app.config.port;
    app.server.listen(port, ()=>{
        console.log("Server is runing on "+port);
        console.log("\n\n\n\n\n");
        console.log("Go to the server http://localhost:"+port);
    });
}

// handle request and response
app.handleReqAndRes = handleReqRes;

// intial the server and listen
app.listenServer();