var logger = require('../tools/logger');

var sha1 = require('sha1');
var Wechat = require('../wechat');
var getRawBody = require('raw-body');
var util = require('../tools/tool-xml2js');
var template = require('../template');

module.exports = function(opts, auto_reply){
    var wechat = new Wechat(opts);
    return function* (next){
        logger.debug('start verify');
        // var that = this;
        var token = opts.token;
        var signature = this.query.signature;
        var nonce = this.query.nonce;
        var timestamp = this.query.timestamp;
        var echostr = this.query.echostr;

        var str = [token, timestamp, nonce].sort().join('');
        var sha = sha1(str);

        if(this.req.method === "GET"){    //验证
            if(sha === signature){
                this.body = echostr + "";
                logger.debug('验证通过');
            }else{
                this.body = 'wrong';
                logger.error('验证失败');
                yield next;  //继续处理请求
            }
        }else if(this.req.method === "POST"){    
            if(sha !== signature){
                return false;
            }
            var data = yield getRawBody(this.req, {
                length : this.length,
                limit : '1mb',
                encoding : this.charset
            });

            let content = yield util.xml2json(data);
            content = content.xml;
            //格式化为标准json返回结果
            var message = util.formatMessage(content);
            logger.debug(message);
            
            this.wechat_message = message;
            yield auto_reply.call(this, next);

            wechat.reply.call(this);


        }
    }
};
