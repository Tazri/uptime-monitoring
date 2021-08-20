/* 
* Title: Project intial file.
* Description: Create server and start the worker
* Author: Md Tazri
* Date: 20/8/2021
*
*/

// dependencies
const server = require("./main/server");
const worker = require("./main/worker");


// app object - module scaffolding
const app = {};

// start the sever and worker
app.init = ()=>{
    // init the server
    server.init();

    // init the worker
    worker.init();
}

// init the app
app.init();

// export the app
module.exports = app;
