const xml2js = require('xml2js');

function xml2json(str){
    return new Promise((resolve, reject)=>{
        const parseString = xml2js.parseString;
        parseString(str, (err, result)=>{
            if(err){
                reject(err);
            }else{
                resolve(result);
            }
        })
    });
}

function json2xml(json){
    const builder = new xml2js.Builder();
    return builder.buildObject(json);
}

module.exports.xml2json =  xml2json;
module.exports.json2xml = json2xml;
