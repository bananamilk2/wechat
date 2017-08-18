'use strict';
var logger = require('../tools/logger');

var fn_home = async(ctx, next)=>{
    ctx.render('index.html', {
        title : 'Welcome!'
    })
};

var fn_signin = async(ctx, next)=>{
    var email = ctx.request.body.email || '',
    password = ctx.request.body.password || '';
    if (email === 'admin@goooku.com' && password === '12345'){
        console.log('signin sucess');
        ctx.render('signin-ok.html', {
            title : 'signin ok',
            name : 'email'
        })
    }else{
        console.log('signin failed');
        ctx.render('signin-failed.html', {
            title : 'signin failed'
        })
    }
};

// var fn_wx_access = async(ctx, next)=>{
   
// };

const wx = require('../wx');


var fn_wx_post = async(ctx, next)=>{
    let msg,
        MsgType,
        result;

    msg = ctx.req.body ? ctx.req.body.xml : '';
    console.log('howard: '+msg);

    if (!msg) {
        ctx.body = 'error request.'
        return 'success';
    }

    MsgType = msg.MsgType[0];
    console.log('接收到消息，类型为：' + MsgType);
    switch (MsgType) {
        case 'text':
            result = wx.message.text(msg, msg.Content);
           
            break;
        
        default: 
            result = 'success'
    }
    ctx.res.setHeader('Content-Type', 'application/xml');
    ctx.res.end(result);
};

var fu_wx = async (ctx, next)=>{
    console.log("**************postFun***********");
    var info = ctx.req.body.xml;
    console.log("postFun info", info);
    
    if (info.MsgType === 'text') {
        if (info.Content == '你好') {
            ctx.res.body = {
                content: '你好',
                type: 'text'
            }
        } else {
            ctx.res.body = {
                type: "music",
                content: {
                    title: "什么都不说了,来段音乐吧",
                    description: "一路上有你",
                    musicUrl: "http://www.xxxxx.com/yilushangyouni.mp3",
                    hqMusicUrl: "http://www/yilushangyouni.mp3",
                    thumbMediaId: "thisThumbMediaId"}
            }
        }
        ctx.res.setHeader('Content-Type', 'application/xml');
        ctx.res.end(ctx.res.body);
    } else if (info.MsgType === 'event') {
        if (info.Event === 'subscribe') { //添加关注事件  
        console.log("用户：" + info.EventKey + "新添加了关注");
        ctx.res.body = {
            content: '你好,欢迎',
            type: 'text'};
        } else {
            console.log('event::', info);
        }
    } else {
        //经试验这个是有问题的，实际是没法播放的，估计是需要上传到微信服务器
        this.body = {
            type: "music",
            content: {
                title: "什么都不说了,来段音乐吧",
                description: "一路上有你",
                musicUrl: "http://sc.111ttt.com/up/mp3/239837/2DF7A5657F60BE1DEF33B8DC3EA42492.mp3",
                hqMusicUrl: "http://sc.111ttt.com/up/mp3/239837/2DF7A5657F60BE1DEF33B8DC3EA42492.mp3",
                thumbMediaId: "thisThumbMediaId"}
        }
    }
    console.log("************** postFun end ***********");
};


var ejs = require('ejs');
var heredoc = require('heredoc');

var tpl = heredoc(function(){/*

<!DOCTYPE html>
<html>
        <head>
            <title>搜电影</title>
            <meta name='viewport' content='initial-scale=1, maximum-scale=1, minimum-scale=1'>
        </head>

        <body>
            <h1>开始录音</h1>
            <p id='title'></p>
            <div id='director'>导演</div>
            <div id='poster'>海报</div>
            <div id='year'>年份</div>

            <script src='http://zeptojs.com/zepto-docs.min.js'></script>
            <script src='http://res.wx.qq.com/open/js/jweixin-1.2.0.js'></script>

            <script>
                wx.config({
                    debug: false, 
                    appId: 'wxb440d73a1047a269', 
                    timestamp: '<%= timestamp %>', 
                    nonceStr: '<%= noncestr %>', 
                    signature: '<%= signature %>',
                    jsApiList: [
                        'startRecord',
                        'stopRecord',
                        'onVoiceRecordEnd',
                        'translateVoice'
                    ]
                });
                wx.ready(function(){
                    wx.checkJsApi({
                        jsApiList : ['onVoiceRecordEnd'],
                        success : function(res){
                            console.log(res);
                        }
                    });
                    var isRecording = false;
                   
                    $('h1').on('tap', function(){
                        if(!isRecording){
                            isRecording = true;
                            wx.startRecord({
                                cancel:function(){
                                    window.alert('不能搜索')
                                }
                            });
                            return ;
                        }
                        isRecording = false;
                        wx.stopRecord({
                            success : function(res){
                                var localId = res.localId;
                                console.log(localId);
                                wx.translateVoice({
                                    localId : localId,
                                    isShowProgressTips : 1,
                                    success : function(res){
                                        console.log('结果：'+res.translateResult)
                                        // window.alert('结果：'+res.translateResult);
                                        $.ajax({
                                            type : 'get',
                                            url : 'https://api.douban.com/v2/movie/search?q='+res.translateResult,
                                            dataType : 'jsonp',
                                            jsonp : 'callback',
                                            success : function(data){
                            
                                                var subject = data.subjects[0];
                                                $('#director').html(subject.directors[0].name)
                                                $('#year').html(subject.year)
                                                $('#poster').html('<img src="' + subject.images.large + '"/>')
                                            }
                                        })

                                    }
                                })
                            }
                        })
                    });
                })
               
            </script>
        </body>
</html>

*/});

var createNonce = function(){
    return Math.random().toString(36).substr(2,15);
}

var createTimestamp = function(){
    return parseInt(new Date().getTime()/ 1000, 10) + '';
}

function sign(ticket, url){
    var noncestr = createNonce();
    var timestamp = createTimestamp();
    var signature = _sign(noncestr, ticket, timestamp, url)
    return {
        noncestr : noncestr,
        timestamp: timestamp,
        signature : signature
    }
}

var crypto = require('crypto');

var _sign = function(noncestr, ticket, timestamp, url){
    var params = [
        'noncestr=' + noncestr, 
        'jsapi_ticket=' + ticket,
        'timestamp=' + timestamp,
        'url=' + url
    ]
    logger.info(params);
    var str = params.sort().join('&');
    var shasum = crypto.createHash('sha1');
    shasum.update(str);
    return shasum.digest('hex'); 
}

var wechat = require('../wechat.js');
var config = require('../config')

var home = async(ctx, next)=>{
    var wechatapi = new wechat(config.wechat);
    var data = await wechatapi.fetchAccessToken();
    var access_token = data.access_token;
    var ticketData = await wechatapi.fetchTicket(access_token);
    var ticket = ticketData.ticket;

    var url = ctx.href;
    // url = url.replace('http://', '');
    logger.info(url);
    var params = sign(ticket, url);
    logger.info(params); 
    
    var rs = ejs.render(tpl, params);
    
    ctx.type = 'text/html';
    ctx.body = rs;
};


module.exports = [
    {
        method : 'POST',
        url : '/signin',
        func : fn_signin
    },
    {
        method : 'GET',
        url : '/',
        func : fn_home
    },
    // {
    //     method : 'GET',
    //     url : '/access',
    //     func : fn_wx_access
    // },
    {
        method : 'POST',
        url : '/',
        func : fu_wx
    },
    {
        method : 'GET',
        url : '/home',
        func : home
    }
];