'use strict';

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
    }
];