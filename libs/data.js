/* 
* Title: Data Utilities
* Description: Utilites for create , read, update and delete data
* Author: Md Tazri
* Date: 9/8/2021
*
*/

// dependencies
const fs = require('fs');
const path = require('path');

// dataLIb object - module scaffolding
const dataLib = {};

// base directory
dataLib.basedir = path.join(__dirname,'../.data/');

// create
dataLib.create = (dir,file,data,callback)=>{
    // strigyfiy the data and create path
    const stringData = JSON.stringify(data);
    let path = dataLib.basedir + dir + '/'+file+'.json';

    // open file
    fs.open(path,'wx',(openError,fileDiscriptor)=>{
        // if error not exist and fileDiscriptor is exist
        if(!openError && fileDiscriptor){
            // write file
            fs.writeFile(fileDiscriptor,stringData,(writeError)=>{
                // if error is not exist
                if(!writeError){
                    // close the file
                    fs.close(fileDiscriptor,(closeError)=>{
                        // if close error is not exist
                        if(!closeError){
                            callback(true);
                        }else{
                            callback("File can not close. Something is wrong.");
                        }
                    })
                }else{
                    callback("Somthing is wrong. File can not write.")
                }
            })
        }else{
            callback("File can not open maybe this name of file exist.");
        }
    })
}

// read
dataLib.read = (dir,file,callback)=>{
    // create pathName
    const pathName = dataLib.basedir+dir+'/'+file+'.json';

    // read file 
    fs.readFile(pathName,'utf-8',(readError,data)=>{
        callback(readError,data);
    });
}

// update
dataLib.update = (dir,file,data,callback)=>{
    // create pathName
    const pathName = dataLib.basedir+dir+'/'+file+'.json';
    const stringData = JSON.stringify(data);

    // open file
    fs.open(pathName,'r+',(openError,fileDiscriptor)=>{
        // if open error dose not exist
        if(!openError && fileDiscriptor){
            // truncate the file
            fs.ftruncate(fileDiscriptor,(truncateError)=>{
                // if truncateError dose not exist
                if(!truncateError){
                    // write file
                    fs.writeFile(fileDiscriptor,stringData,(writeError)=>{
                        // if write error dose not exist
                        if(!writeError){
                            // close the file
                            fs.close(fileDiscriptor,(closeError)=>{
                                // if closeError dose not exist
                                if(!closeError){
                                    callback(true);
                                }else{
                                    callback('File Can not Close.');
                                }
                            })
                        }else{
                            callback("Can not write the file.");
                        }
                    })
                }else{
                    callback("Can not truncate the file.");
                }
            })
        }else{
            callback(">>>> File can not open.");
        }
    })
}

// delete
dataLib.delete = (dir,file,callback)=>{
    // create pathName
    const pathName = dataLib.basedir+dir+'/'+file+'.json';

    // delete data
    fs.unlink(pathName,(deleteError)=>{
        // if delete error dose not exist
        if(!deleteError){
            callback(true);
        }else{
            callback("File can not delete.");
        }
    })
}

// readDir
dataLib.readDir = (dir,callback)=>{
    // create pathName
    const pathName = dataLib.basedir+dir+'/';

    // read dir
    fs.readdir(pathName,(error,fileNamesWithExt)=>{
        // if error exist
        if(error){
            callback("Something is problem."+error);
            return;
        }

        // if all ok then collect all file name without json
        let fileNames = [];

        fileNamesWithExt.forEach(name=>{
            fileNames.push(name.split('.')[0]);
        })

        callback(true,fileNames);
    });
}

// export dataLib
module.exports = dataLib;