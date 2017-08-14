'use strict';
var logger = require('./logger');
var fs = require('fs');
var Promise = require('bluebird');

module.exports.readFileAsync = function(fpath, encoding){
    return new Promise(function(resolve, reject){
        fs.readFile(fpath, encoding, function(err, content){
            if(err){
                reject(err);
            }else{
                resolve(content);
            }
        });
    });
};

module.exports.writeFileAsync = function(fpath, content){
    return new Promise(function (resolve, reject){
        fs.writeFile(fpath, content, function(err, content){
            logger.debug('save token');
            if(err) reject(err);
            else resolve(content);
        });
    });
};

var tpl = require('../template');

module.exports.tpl = function(reply_content, wechat_message){
    var info = {};
    var type = 'text';
    var fromUserName = wechat_message.FromUserName;
    var toUserName = wechat_message.ToUserName;
  
    if(Array.isArray(reply_content)){
        type = 'news';
    }
   
    type = reply_content.type || type;
    info.content = reply_content;
    info.createTime = new Date().getTime();
    info.MsgType = type;
    info.toUserName = fromUserName;
    info.fromUserName = toUserName;
    var ret = tpl.compiled(info);
    
    logger.debug('autoreply: '+ ret);
    return ret;
};

