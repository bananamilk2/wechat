var path = require('path');
var util = require('./tools/util');
var wechat_file = path.join(__dirname, 'wechat.txt');


var app_ID = 'wxb440d73a1047a269';
var app_secret = 'a1293801522fc9dd42dc118fa5ee7c8e';
var app_token = 'howard';

var config = {
    wechat: {
        appID : app_ID,
        appsecret : app_secret,
        token : app_token,
        getAccessToken : function(){
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken : function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data)
        }
    }
}

module.exports = config;