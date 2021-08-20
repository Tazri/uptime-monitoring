/* 
* Title: route
* Description: Handle the all application routes
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// dependencies
const simpleHandler = require('./handlers/simpleHandler');
const { tokenHandler } = require('./handlers/tokenHandler');
const { userHandler } = require('./handlers/userHandler');
const { checkHandler } = require("./handlers/checkHandler");

// routes object - module scaffolding
const routes = {
    simple : simpleHandler,
    user : userHandler,
    token : tokenHandler,
    check : checkHandler
};

// exports routes
module.exports = routes;


