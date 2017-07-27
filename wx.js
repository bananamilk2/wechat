const xml = require('./tools/tool-xml2js');

exports.message = {
    text(msg, content){
        return xml.json2xml({
            xml:{
                ToUserName: msg.FromUserName,
                FromUserName: msg.ToUserName,
                CreateTime: Date.now(),
                MsgType: msg.MsgType,
                Content: content
            }
        });
    }
};

