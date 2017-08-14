'use strict'

var logger = require('./tools/logger');
var Promisee = require('bluebird');
var reques = Promisee.promisify(require('request'));
var req = require('request');
var util = require('./tools/util');
var fs = require('fs');

var prefix = "https://api.weixin.qq.com/cgi-bin/";
var api = {
    accessToken : prefix + 'token?grant_type=client_credential',
    uploadUrl : prefix + 'media/upload?'
};

function Wechat(opts){
    var that = this;
    var name = this.constructor;
    logger.info(name);

    this.appID = opts.appID;
    this.appsecret = opts.appsecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;

    this.getAccessToken().then(function(data){
        try{
            data = JSON.parse(data);
            logger.debug(data);
        }catch(err){
            logger.debug('update token');
            return that.updateAccessToken();
        }

        if(that.isValidToken(data)){
            logger.debug('is valid');
            data.state = true;
            return Promisee.resolve(data);
        }else{
            data.state = false;
            logger.debug('is not valid');
            return that.updateAccessToken();
        }
    }).then(function(data){
        that.access_token = data.access_token;
        that.expires_in  = data.expires_in;
        if(!data.state){
            that.saveAccessToken(data);
        }
    });
};

Wechat.prototype.isValidToken = function(data){
    if(!data || !data.access_token || !data.expires_in){
         return false;
    }

    var access_token = data.access_token;
    var expires_in = data.expires_in;
    var now = new Date().getTime();
    logger.info(expires_in + " ==== " + now);
    if(now < expires_in){
        return true;
    }else{
        return false;
    }
};

Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID;
    var appsecret = this.appsecret;
    let url = api.accessToken + "&appid="+appID + "&secret=" + appsecret;
    return new Promisee(function(resolve, reject){
        reques({url:url, json:true}).then(function(response){
            var data = response.body;
            logger.debug('token: ' + data);
            var now = new Date().getTime();
            var expires_in = now + (20) * 1000;
            data.expires_in = expires_in;
            resolve(data);
        });
    });
}

Wechat.prototype.reply = function(){
    var reply_content = this.body;
    var xml = util.tpl(reply_content, this.wechat_message);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml
}

Wechat.prototype.fetchAccessToken = function(data){
    var that = this;
    logger.info(this.access_token + '____' + this.expires_in);
    if(that.access_token && that.expires_in){
        if(this.isValidToken(this)){
            logger.debug('is valid token');
            return Promisee.resolve(this);
        }
    }

    this.getAccessToken().then(function(data){
        try{
            data = JSON.parse(data);
            logger.debug(data);
        }catch(err){
            logger.debug('update token');
            return that.updateAccessToken();
        }
        if(that.isValidToken(data)){
            return Promisee.resolve(data);
        }else{
            return that.updateAccessToken()
        }
    }).then(function(data){
        that.access_token = data.access_token;
        that.expires_in = data.expires_in;
        that.saveAccessToken(data);
        return Promisee.resolve(data);
    });
}

Wechat.prototype.uploadMedia = function(type, filepath){
    var that = this;
    var form = {
        media : fs.createReadStream(filepath)
    };

    return new Promisee(function(resolve, reject){
        logger.info(that === this);
        logger.info(this);
        that.fetchAccessToken()
        .then(function(data){
            let url = api.uploadUrl + '&access_token=' + data.access_token + '&type=' + type;

            reques({method : 'POST', url:url, formData:form, json:true }).then(function(response){
                let _data = response.body;
                logger.debug(_data);
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('upload file fail');
                }
            }).catch(function(err){
                reject(err);
            });
        });
    });
};

module.exports = Wechat;