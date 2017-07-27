'use strict';

const fs = require('fs');
const path = require('path')

function addMapping(router, mapping) {
    for (var url in mapping) {
        var obj = mapping[url];
        if(obj.method == 'GET'){
            var path = obj.url;
            console.log(`register URL mapping: GET ${path}`);
            router.get(path, obj.func);
        }else if(obj.method == 'POST'){
            var path = obj.url;
            console.log(`register URL mapping: POST ${path}`);
            router.post(path, obj.func);
        }else{
             console.log(`invalid URL: ${obj.url}`);
        }
    }
}

function addControllers(router) {
    var files = fs.readdirSync(path.resolve(__dirname, '..') + '/controllers');
    var js_files = files.filter((f) => {
        return f.endsWith('.js');
    });
    for (var f of js_files) {
        console.log(`process controller: ${f}...`);
        let mapping = require(path.resolve(__dirname, '..') + '/controllers/' + f);
        addMapping(router, mapping);
    }
}

function controll(dir){
    let 
        controllers_dir = dir || '../controllers',
        router = require('koa-router')();
    addControllers(router, controllers_dir);
    return router.routes();
}

module.exports = controll;