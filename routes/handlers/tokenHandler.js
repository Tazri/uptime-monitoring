/* 
* Title: Token Handler
* Description: Create for Token Handle from user.
* Author: Md Tazri
* Date: 15/9/2020
*
*/

// dependencies
let utilities = require("./../../libs/utilitiesFunction");
let dataLib = require("./../../libs/data");

// handler object - module scaffolding
const handler = {};

// token handler
handler.tokenHandler = (requestObject,callback) =>{
    // extract requestObject
    let { method } = requestObject;

    // acceptedMethod
    const acceptedMethod = ['get','post','put','delete'];

    // if method is accepted
    if(acceptedMethod.indexOf(method) > -1){
        // call user method
        handler._token[method](requestObject,callback);
    }else{
        callback(405,{
            message : 'This method not allowed'
        });
    }
}

// create _token moduler
handler._token = {};

// post token
handler._token.post = (requestObject,callback)=>{
    // get body and extract phone and password
    let {phone,password} = requestObject.body;

    // check is phone and password is valid
    let isValidPhone = utilities.isValidPhoneNumber(phone).isValid;
    let isValidPassword = utilities.isValidPassword(password);

    // if phone and password is valid
    if(isValidPhone && isValidPassword.isValid){
        let hashedPassword = isValidPassword.password;
        // check the token is exist or not
        dataLib.read("users",phone,(readError,stringData)=>{
            // if read error dose not exist
            if(!readError){
                // extract userData
                let data = utilities.parseJSON(stringData);
                // check both password is same
                if(hashedPassword === data.password){
                    // create token
                    let token = utilities.getToken(22,phone);

                    // create token file
                    dataLib.create("tokens",token.token,token,(createStatus)=>{
                        // if token is successfully create
                        if(createStatus === true){
                            callback(200,token);
                        }else{
                            // if token is not successfully create
                            callback(500,{error : "something problem in server."});
                        }
                    })
                }else{
                    // if password is not same
                    callback(400,{error: "password is not valid."})
                }
            }else{
                // if read error is exist
                callback(404,{error : "User can not found"});
            }
        })
    }else{
        // if phone and password is not valid
        callback(400,{error: "There was a problem in your request"})
    }
    
}

// get token
handler._token.get = (reqObject,callback)=>{
    // get token
    let {token} = reqObject.queryStringObject;
    
    // is valid token
    let isValidToken = typeof(token) === "string" && token.length === 22;

    // if is valid token
    if(isValidToken){
        // check is token exist ?
        dataLib.read('tokens',token,(readError,stringData)=>{
            let data = utilities.parseJSON(stringData);
            // if readError dose not exist
            if(!readError){
                callback(200,data);
            }else{
                // if readError exist
                callback(500,{error : "token is expired."});
            }
        })
    }else{
        // if is not valid token
        callback(400,{error : "there is a problem on your request"});
    }
}

// update token 
handler._token.put = (reqObject,callback)=>{
    // extract reqObject
    let {token,extend} = reqObject.body;

    // check is valid extend and valid token
    let isValidToken = typeof(token) === "string" && token.length === 22;
    let isValidextend = extend === true ? true : false;

    // if token and extend valid
    if(isValidToken && isValidextend){
        // check token is exist ?
        dataLib.read("tokens",token,(readError,stringData)=>{
            // if readError dose not exist
            if(!readError){
                // get data and check expire
                let data = utilities.parseJSON(stringData);
                let expire = data.expireDate;

                // if token not expired
                if(expire > Date.now()){
                    // update data
                    let date = new Date();
                    data.expireDate = Date.now() + (60*60*60*100);
                    data.lastUpdate = date.toDateString() + " " + date.toTimeString();

                    // update data
                    dataLib.update("tokens",token,data,(updateStatus)=>{
                        // if update successfully
                        if(updateStatus === true){
                            callback(200,data);
                        }else{
                            // if dose not update
                            callback(500,{error : "Something is wrong in server."});
                        }

                    });
                }else{
                    // if token is expired
                    callback(400,{error : "token is expired"});
                }

            }else{
                // if read error exist
                callback(404,{error : "token not found"})
            }
        })
    }else{
        // if token and extend not valid
        callback(404,{error : "there is a problem in your request."})
    }
}

// delete token
handler._token.delete = (reqObject,callback)=>{
    // extract token and check is valid
    let {token} = reqObject.queryStringObject;
    let isValidToken = typeof(token) === "string" && token.length === 22;

    // if token is valid
    if(isValidToken){
        // delete the token
        dataLib.delete("tokens",token,(deleteStatus)=>{
            // if successfully delete
            if(deleteStatus === true){
                callback(200,{
                    message : "Token is delete successfully",
                    date : new Date().toLocaleTimeString("bn-BD")
                })
            }else{
                // if not delete the token
                callback(500,{error : "something is problem in server. or token already delete."});
            }
        })
    }else{
        // if token is not valid
        callback(400,{error : "there is a problem in your request."});
    }
}

// verify token 
handler._token.verify = (token,phone,callback)=>{
    // check token and phone is valid
    let isValidToken = typeof(token) === "string" && token.length === 22;

    // if both are valid
    if(isValidToken){
        // check token is exist
        dataLib.read('tokens',token,(readError,stringData)=>{
            // if readError dose not exist and string data found
            if(!readError && stringData){
                // extract data 
                let data = utilities.parseJSON(stringData);
                
                // check phone match and is expire
                if(data.phone === phone && data.expireDate > Date.now()){
                    callback(true);
                }else{
                    // if phone dose not match of expire the token
                    callback("phone dose not match or token is expire.")
                }

            }else{
                // send the call back
                callback("token dose not exist")
            }
        })
    }else{
        // if both are not valid
        callback("token or phone number is not valid");
    }
}


module.exports = handler;