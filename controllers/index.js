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

var fn_wx_access = async(ctx, next)=>{
    var signature = ctx.query.signature;
    var timestamp = ctx.query.timestamp;
    var nonce = ctx.query.nonce;
    var echostr = ctx.query.echostr;
    console.log(signature + "  " + timestamp + " " + nonce + " " + echostr);
    console.log('验证通过');
    ctx.response.body = echostr;
};

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
    {
        method : 'GET',
        url : '/access',
        func : fn_wx_access
    },
    {
        method : 'POST',
        url : '/access',
        func : fn_wx_post
    }
];