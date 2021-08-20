/* 
* Title: User Handler
* Description: Handler to user releated routes
* Author: Md Tazri
* Date: 10/8/2021
*
*/

// dependencies
const dataLib = require("../../libs/data");
const utilities = require("../../libs/utilitiesFunction");
const {verify} = require("./tokenHandler")._token;

// handler object - module scaffolding
const handler = {};


handler.userHandler = (requestObject,callback) =>{
    // extract requestObject
    let { method } = requestObject;

    // acceptedMethod
    const acceptedMethod = ['get','post','put','delete'];

    // if method is accepted
    if(acceptedMethod.indexOf(method) > -1){
        // call user method
        handler._user[method](requestObject,callback);
    }else{
        callback(405,{
            message : 'This method not allowed'
        });
    }
}

// create _user property for store all user releated method
handler._user = {};

// post
handler._user.post = (requestObject,callback)=>{
    // getUserData
    let userData = requestObject.body;
    let postData = utilities.isValidPostUserData(userData);

    // if postData is Valid
    if(postData.isValid){
        // get user phone number for id
        const phone  = postData.body.phone;

        // check the user alread exist or not
        dataLib.read("users",phone,(readError)=>{
            if(readError){
                // create user
                dataLib.create('users',phone,postData.body,(status)=>{
                    // if create error dose not exist
                    if(status === true){
                        // send the message
                        callback(200,{message : "User create succesfully"});
                    }else{
                        // if error is exist
                        callback(500,{error : "User can not create."})
                    }
                })
            }else{
                // if user is already exist
                callback(500,{error : "User is already exist."})
            }
        })
    }else{
        // if postData is not Valid
        callback(400,{
            message : 'There is problem in you request.'
        })
    }
}

// get
handler._user.get = (requestObject,callback)=>{
    // get pohen and token from requestObject and check is valid
    let phone = requestObject.queryStringObject.phone;
    let {token} = requestObject.headerObject;
    let isValidToken = typeof(token) === 'string' && token.length === 22;

    // if not give the phone number
    if(!phone){
        callback(500,{error : "please send the phone number for user id."});
        return ;
    }else if(!isValidToken){
        callback(403,{error : "Your token is not valid."});
        return;
    }

    // check authenticate 
    verify(token,phone,(status)=>{
        // if status is true
        if(status === true){
            // if give the phone number
            dataLib.read('users',phone,(readError,data)=>{
            // if readError is not exist
            if(!readError){
                // ready the data for send to client
                let userData = utilities.parseJSON(data);
                let getData = {...userData};
            
                // delete the password from the getData
                delete getData.password;
                getData.date = new Date().toLocaleTimeString();
                callback(200,{...getData});
            }else{
                // if readError exist
                callback(404,{error : "User Can not found"})
            }
            })

        }else{
            callback(403,{error : "authentication faliure."});
        }
    })
}

// put
handler._user.put = (requestObject,callback)=>{
    // extract data and get token from user
    let {token} = requestObject.headerObject;
    let userGievenData = requestObject.body;
    let phone = userGievenData.phone;
    let isValidToken = typeof(token) === 'string' && token.length === 22;

    // if token is not valid
    if(!isValidToken){
        callback(403,{error : "token is not valid."});
        return;
    }

    // if token is valid
    verify(token,phone,(status)=>{
        // if token is valid
        if(status === true){
            // if user give the phone number
            if(phone){
                // filter given data
                let filteredData = utilities.fileterForPutData(userGievenData);

                // check is user is exist
                dataLib.read("users",phone,(readError,data)=>{
                    // if readError dose not exist
                    if(!readError){
                        // parse the user data and update the data
                        let userData = utilities.parseJSON(data);
                        let updatedData = utilities.getUpdatedData(userData,filteredData);
                        // update the data
                        dataLib.update("users",phone,updatedData,(updateStatus)=>{
                            // if update succesfully
                            if(updateStatus === true){
                                // delete password and add data in updated data and sent 
                                delete updatedData.password;
                                updatedData.date = new Date().toLocaleTimeString('bn-BD');

                                callback(200,updatedData);
                            }else{
                                // if can not update the data
                                callback(500,{error : "something is problem in server."});
                            }
                        })
                    }else{
                        // if readError is exist
                        callback(404,{error : "user can not found"})
                    }
                })
            }else{
                // if user can not give the phone number
                callback(500,{error : "get not give the phone number."})
            }
        }else{
            // if token is not valid
            callback(403,{error : "authentication faliure. "+status});
        }
    })
}

// delete
handler._user.delete = (requestObject,callback)=>{
    // get phone number and token
    let {token} = requestObject.headerObject;
    let phone = requestObject.queryStringObject.phone;
    let isValidToken = typeof(token) === "string" && token.length === 22;
    
    // check token is valid
    if(!isValidToken){
        callback(403,{error : "token is not valid"});
        return;
    }

    // checkIsValid phone
    let isValidPhone = utilities.isValidPhoneNumber(phone).isValid;

    // if it valid phone
    if(isValidPhone){
        // verify the token
        verify(token,phone,(tokenStatus)=>{
            // if token is valid
            if(tokenStatus === true){
                // delete the user file
                dataLib.delete("users",phone,(deleteStatus)=>{
                    // if delete the user successfully
                    if(deleteStatus === true){
                        callback(200,{
                            message : "User is deleted",
                            date : new Date().toLocaleTimeString("bn-BD")
                        });
                    }else{
                        // if user can not delete
                        callback(500,{error : "user can not delete"});
                    }
                });
            }else{
                // if token is not valid
                callback(403,{error : "token is not deleted or expired."});
            }
        })
    }else{
        // if is not valid phone
        callback(404,{error: "This phone number is not valid."});
    }
}

module.exports = handler;