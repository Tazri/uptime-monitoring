/* 
* Title: route
* Description: Handle the all application routes
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// dependencies
const simpleHandler = require('./handlers/simpleHandler');
const { userHandler } = require('./handlers/userHandler');


// routes object - module scaffolding
const routes = {
    simple : simpleHandler,
    user : userHandler
};

// exports routes
module.exports = routes;


