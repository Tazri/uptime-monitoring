/* 
* Title: Handle Response and Request
* Description: This module for Handle respone and request
* Author: Md Tazri
* Date: 9/8/2021
*
*/

//  handler object - module scaffolding
const handler = {};

// dependencies
const {StringDecoder} = require('string_decoder');
const utilities = require('../libs/utilitiesFunction');
const notFoundHandler = require('./../routes/handlers/notFoundHandler');
const routes = require('../routes/routes');

handler.handleReqRes = (req,res)=>{
    // request handling
    // get url and parse it
    let requestObject = utilities.parseUrl(req);

    // selected handler
    let selectedHandler = routes[requestObject.trimmedPath] || notFoundHandler;

    // collect data
    const decoder = new StringDecoder('utf-8') 
    let realData = '';

    req.on('data',(buffer)=>{
        realData += decoder.write(buffer);
    })

    req.on('end',()=>{
        // create real data and set inside the requestObject
        realData += decoder.end();
        requestObject.body = utilities.parseJSON(realData);

        // call selectedHandler
        selectedHandler(requestObject,(statusCode,payload)=>{
        let status = typeof(statusCode) === 'number' ? statusCode : 500;
        let payloadObject = typeof(payload) === 'object' ? payload : {};


        // payloadString
        const payloadString = JSON.stringify(payloadObject);

        // now response
        res.setHeader("Content-Type","application/json");
        res.writeHead(status);
        res.end(payloadString);
        })
    })
}

module.exports = handler;
