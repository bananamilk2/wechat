const xml2js = require('xml2js');

function xml2json(xml){
    return new Promise((resolve, reject)=>{
        xml2js.parseString(xml, (err, result)=>{
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

function formatMessgae(result){
    var message = {};
    if(typeof result === 'object'){
        var keys = Object.keys(result);
        for(let i=0; i<keys.length; i++){
            var item = result[keys[i]];
            var key = keys[i];
            if(!(item instanceof Array) || item.length === 0){
                continue
            }
            if(item.length === 1){
                var val = item[0];
                if(typeof val === 'object'){
                    message[key] = formatMessage(val);
                }else{
                    message[key] = (val || "").trim();
                }
            }else{
                message[key] = [];
                for(let i=0, j = item.length; i<j; i++){
                    message[key].push(formatMessgae(item[i]));
                }
            }
        }
    }
    return message;
}

module.exports.formatMessage = formatMessgae;