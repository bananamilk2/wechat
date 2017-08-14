var logger = require('./tools/logger');
var config = require('./config');
var Wechat = require('./wechat');

var wechatApi = new Wechat(config.wechat);

module.exports.reply = function*(next){
    var message = this.wechat_message;
    logger.debug(message);
    if(message.MsgType === 'event'){
        if(message.Event === 'subscribe'){
            logger.debug('用户订阅');
            if(message.EventKey){
                logger.debug('扫码进入: ' + message.EventKey + "  " + message.ticket);
            }
            this.body = '欢迎订阅本公众号';
        }else if(message.Event === 'unsubscribe'){
            logger.debug('取消订阅');
            this.body = "取消订阅了";
        }else if(message.Event === 'LOCATION'){  
            this.body = '您的位置是: ' + message.Latitude + '/' + message.Longitude + '/' + message.Precision;
        }else if(message.Event === 'CLICK'){
            this.body = '您点击了菜单:' + message.EventKey;
        }else if(message.Event === 'SCAN'){
            logger.debug('关注后扫面二维码: ' + message.EventKey + '  ' + message.ticket);
            this.body = '看到扫一下';
        }else if(message.Event === 'VIEW'){
            this.body = '您点击了菜单中的链接: ' + message.EventKey;
        }
    }else if(message.MsgType === 'text'){
        var content = message.Content;
        var reply = '您说的对';
      
        // reply = [{
        //     title:'技术改变世界',
        //     description : '只是个描述',
        //     picurl: 'http://wx4.sinaimg.cn/mw600/852a13f1ly1fiftm2cgjfj20xc1e0qf4.jpg',
        //     url : 'http://jandan.net/ooxx'
        // },{
        //     title:'技术改变世界2',
        //     description : '只是个描述2',
        //     picurl: 'http://wx4.sinaimg.cn/mw600/852a13f1ly1fiftm2cgjfj20xc1e0qf4.jpg',
        //     url : 'http://jandan.net/ooxx'
        // }];
        if(content === '1'){
            var data = yield wechatApi.uploadMedia('image', __dirname + '/1.jpg');
            reply = {
                type : 'image',
                media_id: data.media_id
            }    
        }else if(content === '2'){
            var data = yield wechatApi.uploadMedia('video', __dirname + '/1.mp4');
            reply = {
                type : 'video',
                title : '视频',
                description : '呵呵',
                media_id : data.media_id
            }
        }

        this.body = reply;
        
    }else if(message.MsgType === 'video'){

    }
    yield next;
};