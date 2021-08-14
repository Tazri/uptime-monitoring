/* 
* Title: Simple Handler
* Description: This handler for testing the route work parfectly or not
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// exports the route functoin
module.exports = function(requestObject,callBack){
    console.log(requestObject);
    callBack(200,{
        message : 'This is simple for test restfull api.'
    })
}