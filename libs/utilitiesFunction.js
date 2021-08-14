/* 
* Title: utilites function
* Description: Here create the function for simple work
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// dependencies
const url = require('url');
const crypto = require('crypto');
const enviromentToExport = require('../helpers/enviroment');

// utilities object - module scaffolding
const utilities = {};

// parseUrl
utilities.parseUrl = (req)=>{
    // extract req
    const parseUrl = url.parse(req.url,true);
    const path = parseUrl.pathname;
    const trimmedPath = path.replace(/^\/+|\/+$/g,'');
    const method = req.method.toLowerCase();
    const queryStringObject = parseUrl.query;
    const headerObject = req.headers;

    // create own request object
    const requestObject = {
        parseUrl,
        path,
        trimmedPath,
        method,
        queryStringObject,
        headerObject
    }

    return requestObject;
}

// parseJSON
utilities.parseJSON = (stringData)=>{
    let output ;

    // try to parse object
    try{
        output = JSON.parse(stringData);
    }catch(parseError){
        output = {};
    }

    return output;
}

// isValidPostUserData 
utilities.isValidPostUserData = (userData)=>{
    /**
     * data will be like
     * {
     * firstName : 'Md',
     * lastName : 'Tazri',
     * phone : '01234567891',
     * gender : 'male/female',
     * isAgree : true/false,
     * password : **********
     * }
     */

    // get valid data 
    let validData = utilities.compactData(userData);

    // check all 6 data is here ?
    let isValidPostData = Object.keys(validData).length === 6 ? true : false;

    // createPostData
    let postData = {
        isValid : false
    }

    // if is Valid post data
    if(isValidPostData){
        postData.isValid = true;
        postData.body = validData;
    }
    
    // return postData
    return postData;
}

utilities.fileterForPutData = (userData)=>{
    // compact the data
    let compactedData = utilities.compactData(userData);

    // extract the data
    let {
        firstName,
        lastName,
        gender,
        password
    } = compactedData;

    // create put data
    let putData = {};
    
    // store put data
    if(firstName){
        putData.firstName = firstName;
    }

    if(lastName){
        putData.lastName = lastName;
    }

    if(gender){
        putData.gender = gender
    }

    if(password){
        putData.password = password;
    }

    return putData;
}

// remove all unvalid data
utilities.compactData = (userData)=>{
    // extract the userData
    let {
        firstName,
        lastName,
        phone,
        gender,
        isAgree,
        password
    } = userData;

    // getAll valid Data
    let compactUser = {}

    // check everything is valid
    let isValidName = utilities.isValidName(firstName,lastName).isValid;
    let isValidPhone = utilities.isValidPhoneNumber(phone).isValid;
    let isValidGenderType = utilities.isValidGenderType(gender).isValid;
    let isAgreeValid = utilities.isAgreeValid(isAgree).isValid;
    let isValidPassword = utilities.isValidPassword(password);

    // if name is valid
    if(isValidName){
        compactUser.firstName = firstName;
        compactUser.lastName = lastName;
    }

    // if phone number is valid
    if(isValidPhone){
        compactUser.phone = phone;
    }

    // if gender is valid
    if(isValidGenderType){
        compactUser.gender = gender;
    }

    // if user is agree
    if(isAgreeValid){
        compactUser.isAgree = isAgree;
    }

    // if password is valid
    if(isValidPassword.isValid){
        compactUser.password = isValidPassword.password;
    }

    return compactUser;
}

// isValidName 
utilities.isValidName=  (firstName,lastName)=>{
    // check both are string ?
    let nameObject = {
        fullName : '',
        firstName,
        lastName,
        isValid : false,
    };

    // check both are string ??
    if(typeof(firstName) != 'string'  || typeof(lastName) != 'string'){
        return nameObject;
    }

    // check both string are not empty
    if(!firstName.trim() && !lastName.trim()){
        return nameObject;
    }

    // create full name
    nameObject.fullName = firstName.trim() + ' ' + lastName.trim();


    // check full name length greater then 7
    if(nameObject.fullName.length < 7){
        return nameObject
    }

    // return valid nameObject
    nameObject.isValid = true;
    return nameObject;
}

utilities.isValidPhoneNumber = phone=>{
    // number object
    let numberObject = {
        phone,
        isValid : false
    }

    // if is not string
    if(!typeof(phone) === "string"){
        return numberObject;
    }

    
    //  number array
    const numberArray = ['0','1','2','3','4','5','6','7','8','9'];

    // check number length less then 11
    if(phone.length < 11){
        return numberObject
    }


    // check every think is number
    let phoneInString = phone.split('');
    for(n of phoneInString){
        if(numberArray.indexOf(n) < 0){
            return numberObject;
        }
    }

    // return valid numberObject
    numberObject.isValid = true;
    return numberObject
}

utilities.isValidGenderType = gender =>{
    // create genderObject
    let genderObject = {
        gender,
        isValid : false
    }

    // if gender is not string
    if(!typeof(gender) == "string"){
        return genderObject
    }

    // check is male or female
    if(gender == 'male' || gender == 'female'){
        // return valid genderObject
        genderObject.isValid = true;
        return genderObject;
    }

    return genderObject;
}

// isAgreeValid
utilities.isAgreeValid = (isAgree)=>{
    let isAgreeObject = {
        isAgree,
        isValid : false
    }

    if(isAgree === true){
        isAgreeObject.isValid = true;
    }

    return isAgreeObject;
}

// isValidPassword
utilities.isValidPassword = password =>{
    // passwordObject
    let passwordObject = {
        password,
        isValid : false
    }

    // if is not string
    if(!typeof(password) == "string"){
        return passwordObject
    }

    // if password length is not greater then 6
    if(password.length < 6){
        return passwordObject;
    }

    // return valid passwordObject
    passwordObject.isValid = true;

    // get secret key from enviroment data
    let secretKey = enviromentToExport.secretKey;

    // hash the password 
    let hash = crypto.createHmac("sha256",secretKey)
    .update(password).digest("hex");

    // change password to hash
    passwordObject.password = hash;

    return passwordObject;
}

utilities.getUpdatedData = (userData,updateData)=>{
    // extract updatedData
    let {
        gender,
        firstName,
        lastName,
        password
    } = updateData;

    // create data object which return the end
    let data = {...userData};

    // update information
    if(gender){
        data.gender = gender;
    }

    if(firstName){
        data.firstName = firstName;
    }

    if(lastName){
        data.lastName = lastName;
    }

    if(password){
        data.password = password;
    }

    return data;
}

// export 
module.exports = utilities;