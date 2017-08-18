'use strict';

const logger = require('./tools/logger');

const isProduction = process.env.NODE_ENV === 'production';

const Koa = require('koa');

const app = new Koa();

const verify     = require('./middlewares/middleware-verify');
const recording  = require('./middlewares/middleware-recording');
const bodyParser = require('koa-bodyparser');
const controller = require('./middlewares/middleware-controller');
const templating = require('./middlewares/middleware-templating');
const staticFiles= require('./middlewares/middleware-static-files');
const xmlParser  = require('./middlewares/middleware-xmlparser');
const wx = require('./wx')
const config = require('./config');
const autoReply = require('./auto_reply');

app.use(verify(config.wechat, autoReply.reply));
// app.use(recording());
app.use(staticFiles('/static/', __dirname + '/static'));
app.use(bodyParser());
app.use(xmlParser());
app.use(templating('view', {
    noCache : !isProduction,
    watch : !isProduction
}))
app.use(controller());

app.listen(8080);
logger.debug('app started at port 8080');

var schedule  = require('node-schedule');
var rule = new schedule.RecurrenceRule();
var time = [1,6,11,16,21,26,31,36,41,46,51,56];
rule.second = time;
// schedule.scheduleJob(rule, function(){
//     console.log('log')
// })
// var express = require('express');
// var bodyparser = require('body-parser');
// var app1 = express();

// app1.set('port', 8080);
// app1.use(bodyparser.json());
// app1.use(bodyparser.urlencoded({extended: true}));
// app1.use('/access', require('./wechat'));
// app1.get('/access', function(req, res){
//     var signature = req.query.signature;
//     var timestamp = req.query.timestamp;
//     var nonce = req.query.nonce;
//     var echostr = req.query.echostr;
//     console.log(signature + "  " + timestamp + " " + nonce + " " + echostr);
//     console.log('验证通过');
//     res.send(echostr);
// });

// app1.use('/access', function(req, res){
//     console.log('middleware');
//     res.send('success');
// });
// app1.post('/access', function(req, res){
//     console.log('hard: ');
//     res.send('success');
   
// });
// app1.listen(app1.get('port'), function(){
//     console.log('Server listening on:', app1.get('port'));
// });


//------------------
// var https = require('request');
// var qs = require('querystring');
// var data = {
//     grant_type : 'client_credential',
//     appid : app_ID,
//     secret : app_secret
// };
// var content = qs.stringify(data); 
// var url = 'https://api.weixin.qq.com' + '/cgi-bin/token?' + content;

// var token = "";

// https(url, function(error, response, body){
//     // var obj = eval('(' + body + ')');
//     var obj = JSON.parse(body);
//     console.log('token: '+obj.access_token);
//     token = obj.access_token;
// });

//---------------------



var WechatAPI = require('wechat-api');
//创建自定义菜单
// var api = new WechatAPI(app_ID, app_secret);

var menu = {"button":[
    {
        "type":"click",
        "name":"今日歌曲",
        "key":"V1001_TODAY_MUSIC"
    },
    {
        "name":"菜单",
        "sub_button":[
            {
                "type":"view",
                "name":"搜索",
                "url":"http://www.soso.com/"
            },
            {
                "type":"click",
                "name":"赞一下我们",
                "key":"V1001_GOOD"
            }
        ]
     }
    ]};

// var co = require('co');
// console.log('appMenu start');
// api.createMenu(menu, function(err, result) {
//     if (err) {
//       throw err
//     };
//     console.log('appMenu', result);
//   });
//   console.log('appMenu end');
