/* 
* Title: Not Found Handler
* Description: This handler for 404 request
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// export handler
module.exports = function(reqestObject,callBack){
    callBack(404,{
        message : '404 Not Found The Page'
    })
}