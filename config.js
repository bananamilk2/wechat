var logger = require('./tools/logger');
var path = require('path');
var util = require('./tools/util');
var wechat_file = path.join(__dirname, 'wechat.txt');
var ticket_file = path.join(__dirname, 'ticket.txt');


var app_ID = 'wxb440d73a1047a269';
var app_secret = 'a1293801522fc9dd42dc118fa5ee7c8e';
var app_token = 'howard';

var config = {
    wechat: {
        appID : app_ID,
        appsecret : app_secret,
        token : app_token,
        getAccessToken : function(){
            logger.info('getAccessToken');
            return util.readFileAsync(wechat_file);
        },
        saveAccessToken : function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(wechat_file, data)
        },
        getTicket : function(){
            logger.info('getTicket');
            return util.readFileAsync(ticket_file);
        },
        saveTicket : function(data){
            data = JSON.stringify(data);
            return util.writeFileAsync(ticket_file, data)
        }
    }
}

module.exports = config;