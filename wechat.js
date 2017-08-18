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
    uploadUrl : prefix + 'media/upload?',
    group : {
        create : prefix + 'groups/create',
        fetch : prefix + 'group/get',
        check : prefix + 'groups/getid',
        update : prefix + 'groups/update',
        move : prefix + 'groups/members/update',
        batchmove : prefix + 'groups/members/batchupdate?',
        delete : prefix + 'groups/delete?'
    },
    menu : {
        create : prefix+ 'menu/create?',
        get : prefix + 'menu/get?',
        delete : prefix + 'menu/delete?',
        fetch : prefix + 'get_current_selfmenu_info?'
    },
    ticket : {
        get : prefix +  'ticket/getticket?access_token='
    }

};

var semanticPrefix = 'https://api.weixin.qq.com/semantic/semproxy/search?access_token='



function Wechat(opts){
    var that = this;
    this.appID = opts.appID;
    this.appsecret = opts.appsecret;
    this.getAccessToken = opts.getAccessToken;
    this.saveAccessToken = opts.saveAccessToken;
    this.getTicket = opts.getTicket;
    this.saveTicket = opts.saveTicket;

    // this.getAccessToken().then(function(data){
    //     try{
    //         data = JSON.parse(data);
    //         logger.debug(data);
    //     }catch(err){
    //         logger.debug('update token');
    //         return that.updateAccessToken();
    //     }

    //     if(that.isValidToken(data)){
    //         logger.debug('is valid');
    //         data.state = true;
    //         return Promisee.resolve(data);
    //     }else{
    //         data.state = false;
    //         logger.debug('is not valid');
    //         return that.updateAccessToken();
    //     }
    // }).then(function(data){
    //     that.access_token = data.access_token;
    //     that.expires_in  = data.expires_in;
    //     if(!data.state){
    //         that.saveAccessToken(data);
    //     }
    // });
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

Wechat.prototype.isValidTicket = function(data){
    if(!data || !data.ticket || !data.expires_in){
        return false;
    }
    var ticket = data.ticket;
    var expires_in = data.expires_in;
    var now = new Date().getTime();
    if(now < expires_in)
        return true;
    else
        return false;
}

Wechat.prototype.updateAccessToken = function(){
    var appID = this.appID;
    var appsecret = this.appsecret;
    let url = api.accessToken + "&appid="+appID + "&secret=" + appsecret;
    return new Promisee(function(resolve, reject){
        reques({url:url, json:true}).then(function(response){
            var data = response.body;
            logger.debug('token: ' + data);
            var now = new Date().getTime();
            var expires_in = now + (data.expires_in - 20) * 1000;
            data.expires_in = expires_in;
            resolve(data);
        });
    });
}

Wechat.prototype.updateTicket = function(access_token){
    var that = this;
    var url = api.ticket.get + access_token + '&type=jsapi';
    // that.ticketUrl = url;
    return new Promisee(function(resolve, reject){
        reques({url:url, json:true}).then(function(response){
            var data = response.body;
            var now = new Date().getTime();
            var expires_in = now + (data.expires_in -20) * 1000;
            data.expires_in = expires_in;
            resolve(data);
        })
    })
}

Wechat.prototype.reply = function(){
    var reply_content = this.body;
    var xml = util.tpl(reply_content, this.wechat_message);

    this.status = 200;
    this.type = 'application/xml';
    this.body = xml
}

Wechat.prototype.fetchAccessToken = function(data){
    logger.debug('fetch_sccess_token');
    var that = this;
    if(that.access_token && that.expires_in){
        if(this.isValidToken(this)){
            logger.debug('is valid token');
            return Promisee.resolve(this);
        }
    }

    return that.getAccessToken().then(function(data){
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

Wechat.prototype.fetchTicket = function(access_token){
    var that = this;
    // var url = api.ticket.get + access_token + '&type=jsapi';
    // that.ticketUrl = url;
    return this.getTicket().then(function(data){
        try{
            data = JSON.parse(data);
        }catch(err){
            return that.updateTicket(access_token);
        }
        if(that.isValidTicket(data)){
            return Promise.resolve(data);
        }else{
            return that.updateTicket(access_token);
        }
    }).then(function(data){
        that.saveTicket(data);
        return Promise.resolve(data); 
        // return data;
    })
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


Wechat.prototype.createGroup = function (name){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.create + 'access_token=' + data.access_token;
            var options = {
                name : name
            };
            reques({method:'POST', url : url, body:options, json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('create group error');
                    reject('create err');
                }
            });
        });
    });
}

Wechat.prototype.fetchGroup = function(name){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.fetch + 'access_token=' + data.access_token;
        
            reques({url:url, json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    reject('fetch error');
                }
            });
        });
    });
}

Wechat.prototype.checkGroup = function(openId){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.check + 'access_token=' + data.access_token;
            var options = {
                openId : openId
            }
            reques({method:'POST', url : url, body:options, json:true}).then(function(response){
            var _data = response.body;
            if(_data){
                resolve(_data);
            }else{
                throw new Error('check group error');
                reject('err');
            }
        });
        });
    });
}

Wechat.prototype.updateGroup = function(id, name){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.update + 'access_token=' + data.access_token;
            var options = {
                group : {
                    id : id,
                    name : name
                }
            }
            reques({method:'POST', url : url, body:options, json:true}).then(function(response){
            var _data = response.body;
            if(_data){
                resolve(_data);
            }else{
                throw new Error('update group error');
                reject('err');
            }
        });
        });
    });
}

Wechat.prototype.moveGroup = function(openId, to){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.move + 'access_token=' + data.access_token;
            var options = {
                openId : openId,
                to_groupid : to
            };
            reques({method:'POST', url : url, body:options, json:true}).then(function(response){
            var _data = response.body;
            if(_data){
                resolve(_data);
            }else{
                throw new Error('move group error');
                reject('err');
            }
        });
        });
    });
}

Wechat.prototype.batchMoveGroup = function(openid_list, group_id){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.batchmove + 'access_token=' + data.access_token;
            var options = {
                openid_list : openid_list,
                to_groupid : group_id
            };
            reques({method:'POST', url : url, body:options, json:true}).then(function(response){
            var _data = response.body;
            if(_data){
                resolve(_data);
            }else{
                throw new Error('batchmove group error');
                reject('err');
            }
        });
        });
    });
}

Wechat.prototype.deleteGroup = function(id){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.group.delete + 'access_token=' + data.access_token;
            var options = {
                group : {
                    id : id,
                }
            }
            reques({method:'POST', url : url, body:options, json:true}).then(function(response){
            var _data = response.body;
            if(_data){
                resolve(_data);
            }else{
                throw new Error('delete group error');
                reject('err');
            }
        });
        });
    });
}

//---------------menu-------------

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

Wechat.prototype.createMenu = function(menu){
    var that = this;
    return new Promisee(function(resolve, reject){
        logger.debug('createMenu');
        that.fetchAccessToken().then(function(data){
            var url = api.menu.create + 'access_token=' + data.access_token;
            logger.debug(url)
            reques({method : 'POST', url:url, body:menu, json:true}).then(function(response){
                var _data = response.body;
                logger.debug(_data);
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('create menu failed');
                    reject('err');
                }
            });
        });
    });
}

Wechat.prototype.getMenu = function(menu){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menu.get + 'access_token=' + data.access_token;
            reques({url:url, json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('get menu failed');
                    reject('err');
                }
            });
        });
    });
}

Wechat.prototype.deleteMenu = function(menu){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menu.delete + 'access_token=' + data.access_token;
            reques({url:url, json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('delete menu failed');
                    reject('err');
                }
            });
        });
    });
}

Wechat.prototype.fetchMenu = function(menu){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = api.menu.fetch + 'access_token=' + data.access_token;
            reques({url:url, json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('delete menu failed');
                    reject('err');
                }
            });
        });
    });
}



//------------semantic----------

Wechat.prototype.semantic = function(semanticData){
    var that = this;
    return new Promisee(function(resolve, reject){
        that.fetchAccessToken().then(function(data){
            var url = semanticPrefix + data.access_token;
            semanticData.appid = data.appID;
            reques({method:'POST', url:url, body:semanticData, json:true}).then(function(response){
                var _data = response.body;
                if(_data){
                    resolve(_data);
                }else{
                    throw new Error('delete menu failed');
                    reject('err');
                }
            });
        });
    });
}

module.exports = Wechat;