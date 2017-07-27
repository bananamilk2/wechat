'use strict';

const isProduction = process.env.NODE_ENV === 'production';

var appID = 'wxb440d73a1047a269';
var appsecret = 'a1293801522fc9dd42dc118fa5ee7c8e';

const Koa = require('koa');

const app = new Koa();

const recording  = require('./middlewares/middleware-recording')
const bodyParser = require('koa-bodyparser');
const controller = require('./middlewares/middleware-controller');
const templating = require('./middlewares/middleware-templating');
const staticFiles= require('./middlewares/middleware-static-files');
const xmlParser  = require('./middlewares/middleware-xmlparser');
const wx = require('./wx')

app.use(recording());
app.use(staticFiles('/static/', __dirname + '/static'));
app.use(bodyParser());
app.use(xmlParser());
app.use(templating('view', {
    noCache : !isProduction,
    watch : !isProduction
}))
app.use(controller());

app.listen(8080);
console.log('app started at port 8080');

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


// var https = require('request');
// var qs = require('querystring');
// var data = {
//     grant_type : 'client_credential',
//     appid : appID,
//     secret : appsecret
// };
// var content = qs.stringify(data); 
// var url = 'https://api.weixin.qq.com' + '/cgi-bin/token?' + content;

// https(url, function(error, response, body){
//     console.log('body: ', body);
// });

