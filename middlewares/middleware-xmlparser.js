const xml = require('../tools/tool-xml2js');

module.exports = ()=>{
    return async(ctx, next)=>{
        if(ctx.method === 'POST' && ctx.is('text/xml')){
            let promise = new Promise(function(resolve, reject){
                let buf = '';
                ctx.req.setEncoding('utf8');
                ctx.req.on('data', (chunk)=>{
                    buf += chunk;
                })
                ctx.req.on('end', ()=>{
                    xml.xml2json(buf).then(resolve).catch(reject);
                })
            });

            await promise.then((result)=>{
                console.log(result);
                ctx.req.body = result;
            }).catch((e)=>{
                e.status = 400;
            });

            next();
        }else{
            await next();
        }
    }
}