const express = require('express');

const route = express.Router();
const request = require('request');
const sql = require('./signin');
const cost = require('./cost');
const theft = require('./theft');
const words = require('./words');
var xmldoc = require('xmldoc');

const schedule = require('node-schedule');
const axios = require('axios');
const config = require('./config')

// var mywxid = "wxid_ph2p2s4tcyag22"; //机器人wxid
// let botname = '@Taco '
// var url = "http://127.0.0.1:7777/DaenWxHook/httpapi/?wxid=" + mywxid;
// var path = "DaenWxHook/httpapi/"
// let txurl = "https://apis.tianapi.com/"
// let txtoken = "3bf51555df0c7ce4b2c45a99bae3f71d"
let mywxid = config.mywxid; //机器人wxid
let botname = config.botname
let url = config.url
let path = config.path
let txurl = config.txurl
let txtoken = config.txtoken





route.post('/', (req, res) => {
    console.log(req.query)
    req.on("data", async function (data) {
        // console.log(data)
        try {
            var params = JSON.parse(data.toString());
            console.log(params)
        } catch (error) {
            console.log(error);
            console.log(data);
            return;
        }

        switch (params.event) {
            case 10006: //转账事件，自动收款
                if (params.data.data.msgSource == "1") {
                    receiveMoney({
                        "type": "Q0016",
                        "data": {
                            "wxid": params.data.data.fromWxid,
                            "transferid": params.data.data.transferid,
                        }
                    })
                }
                break;
            case 10007://二维码收款事件
                var re = /收款金额￥.+/;
                var data = params.data.data.msg;
                var result = data.match(re);
                console.log(result[0].split("￥")[1]); //打印收款金额
                break;
            case 10008://群聊消息自动回复
                if (params.data.data.msgType == "1" && params.data.data.fromType == "2") {

                    // console.log(params.data.data.msg);
                    // console.log(params.data.data.msg.length);
                    // console.log(params.data.data.msg);
                    // sql.signin(params.data.data.msg)

                    if (params.data.data.msg == `${botname}签到`) {
                        let msg = await sql.signin(params.data.data.finalFromWxid);
                        sendMessage({
                            "type": "Q0001",
                            "data": {
                                "wxid": params.data.data.fromWxid,
                                // "msg":"你好\n我是你的微信机器人\r我叫唠个锤子" //这里是回复内容 \r和\n是换行符
                                "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                            }
                        })
                    } else if (params.data.data.msg == `${botname}积分查询`) {
                        let msg = await sql.getcount(params.data.data.finalFromWxid)
                        sendMessage({
                            "type": "Q0001",
                            "data": {
                                "wxid": params.data.data.fromWxid,
                                // "msg":"你好\n我是你的微信机器人\r我叫唠个锤子" //这里是回复内容 \r和\n是换行符
                                "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                            }
                        })

                    } else if (params.data.data.msg == `${botname}积分列表`) {
                        let msg = await sql.getcountall()
                        sendMessage({
                            "type": "Q0001",
                            "data": {
                                "wxid": params.data.data.fromWxid,
                                // "msg":"你好\n我是你的微信机器人\r我叫唠个锤子" //这里是回复内容 \r和\n是换行符
                                "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                            }
                        })
                    }
                    else if (params.data.data.msg == `${botname}今日热点`) {

                        let msg = await cost.cost(params.data.data.finalFromWxid, 20)
                        if (msg == 0) {
                            let { data } = await news()
                            let arr = data.result.list
                            let msg = '今日热点\n'
                            for (let i = 0; i < arr.length; i++) {
                                msg += `${i + 1}、${arr[i].word}\n`
                                if (i > 18) {
                                    break
                                }
                            }
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    // "msg":"你好\n我是你的微信机器人\r我叫唠个锤子" //这里是回复内容 \r和\n是换行符
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        } else {
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg == `${botname}彩虹屁`) {
                        let msg = await cost.cost(params.data.data.finalFromWxid, 8)
                        if (msg == 0) {
                            let { data } = await caihongpi()
                            let msg = data.result.content
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        } else {
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg.startsWith(`${botname}星座`) && params.data.data.msg.length == 11) {
                        let msg = await cost.cost(params.data.data.finalFromWxid, 10)
                        if (msg == 0) {
                            let astro = params.data.data.msg.substring(8, 11)
                            let { data } = await star(astro)
                            if (data.code == 200) {
                                let arr = data.result.list
                                let msg = `${astro}\n`
                                for (let item of arr) {
                                    msg += `${item.type}: ${item.content}\n`
                                }
                                sendMessage({
                                    "type": "Q0001",
                                    "data": {
                                        "wxid": params.data.data.fromWxid,
                                        "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                    }
                                })
                            } else {
                                let msg = `星座格式有误, 例: ${botname}星座双鱼座`
                                sendMessage({
                                    "type": "Q0001",
                                    "data": {
                                        "wxid": params.data.data.fromWxid,
                                        "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                    }
                                })
                            }


                        } else {
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg.startsWith(`${botname}偷窃`)) {
                        let str = params.data.data.msg
                        let inarr = str.trim().split(/\s+/)
                        if (inarr.length == 3) {
                            let msg = await cost.cost(params.data.data.finalFromWxid, 2)
                            if (msg == 0) {
                                let msg = await theft.theft(params.data.data.finalFromWxid, inarr[2])
                                // if (msg.code == 0) {
                                // }
                                console.log(msg);
                                sendMessage({
                                    "type": "Q0001",
                                    "data": {
                                        "wxid": params.data.data.fromWxid,
                                        "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                    }
                                })
                            } else {
                                sendMessage({
                                    "type": "Q0001",
                                    "data": {
                                        "wxid": params.data.data.fromWxid,
                                        "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                    }
                                })
                            }
                        } else {
                            let msg = `格式有误, 例: ${botname}偷窃 雪梨`
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg.startsWith(`${botname}充值`)) {
                        let str = params.data.data.msg
                        let inarr = str.trim().split(/\s+/)
                        console.log(inarr);
                        if (inarr.length == 4) {
                            let msg = await cost.recharge(params.data.data.finalFromWxid, inarr[2], inarr[3])
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        } else {
                            let msg = `格式有误, 例: ${botname}充值 雪梨 20`
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg.startsWith(`${botname}不可描述`)) {
                        let str = params.data.data.msg
                        let inarr = str.trim().split(/\s+/)
                        if (inarr.length == 4) {
                            let msg = await cost.pc(params.data.data.finalFromWxid, inarr[2], inarr[3])
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        } else {
                            let msg = `格式有误, 例: ${botname}不可描述 雪梨 20`
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg.startsWith(`${botname}成语接龙`) || (params.data.data.msg.startsWith(`S`) && params.data.data.msg.length == 6)) {
                        let str = params.data.data.msg
                        let inarr = str.trim().split(/\s+/)
                        if (inarr.length == 3) {
                            // if(inarr[1] == '重开'){

                            // }
                            let msg = words.words(inarr[2])
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `成语接龙\n${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        } else {
                            let msg = `格式有误, 例: ${botname}成语接龙 四字成语`
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    } else if (params.data.data.msg.startsWith(`${botname}帮助`)) {
                        let msg = `主要功能:\n ${botname}签到\n ${botname}积分查询\n ${botname}积分列表\n ${botname}今日热点 -----------20\n ${botname}彩虹屁 -----------8\n ${botname}星座金牛座   -------10\n ${botname}充值 雪梨 20 ps: 仅管理员有效\n ${botname}偷窃 雪梨 ----------2 ps: 偷窃花费2积分 有百分之50几率失效 偷到1-5积分不等\n ${botname}不可描述 k老师 2  ps: 积分转账\n ${botname}成语接龙 一心一意 \n 目前名册:  雪梨,Taco,k老师 \n 签到获得5-40不等 \n积分消耗规则: 初始价格*折扣`
                        sendMessage({
                            "type": "Q0001",
                            "data": {
                                "wxid": params.data.data.fromWxid,
                                "msg": `成语接龙\n${msg}` //这里是回复内容 \r和\n是换行符
                            }
                        })
                    } else if (params.data.data.msg == `${botname}emo`){
                        let msg = await cost.cost(params.data.data.finalFromWxid, 8)
                        if (msg == 0) {
                            let { data } = await pyqwenan()
                            let msg = data.result.content
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        } else {
                            sendMessage({
                                "type": "Q0001",
                                "data": {
                                    "wxid": params.data.data.fromWxid,
                                    "msg": `${msg}` //这里是回复内容 \r和\n是换行符
                                }
                            })
                        }
                    }
                }
                break;
            case 10009: //好友消息自动回复
                if (params.data.data.msgType == "1" && params.data.data.fromType == "1") {
                    sendMessage({
                        "type": "Q0002",
                        "data": {
                            "wxid": params.data.data.fromWxid,
                            "msg": "你好\n我是你的微信机器人\r我叫唠个锤子" //这里是回复内容 \r和\n是换行符
                        }
                    })
                }
                break;
            case 10011://加好友秒通过
                agreeFriend({
                    "type": "Q0017",
                    "data": {
                        "scene": params.data.data.scene,
                        "v3": params.data.data.v3,
                        "v4": params.data.data.v4
                    }
                })
                setUserinfo({ wxid: params.data.data.wxid })
                break;
            default:
                break;
        }
        res.send({
            stateCode: 200,
        })
    });

})

// 定时器区




// function scheduleCronstyle(){
//     schedule.scheduleJob('30 * * * * *', function(){
//         console.log('scheduleCronstyle:' + new Date());
//     }); 
// }

// scheduleCronstyle();


// 天行api区


const news = async () => {
    let params = {
        key: txtoken
    }
    try {
        return await axios.get(txurl + 'toutiaohot/index', { params })
    } catch (error) {
        console.error(error)
    }
}
const caihongpi = async () => {
    let params = {
        key: txtoken
    }
    try {
        return await axios.get(txurl + 'caihongpi' + '/index', { params })
    } catch (error) {
        console.error(error)
    }
}
const star = async (astro) => {
    let params = {
        key: txtoken,
        astro
    }
    try {
        return await axios.get(txurl + 'star' + '/index', { params })
    } catch (error) {
        console.error(error)
    }
}

// https://apis.tianapi.com/pyqwenan/index
const pyqwenan = async (astro) => {
    let params = {
        key: txtoken,
    }
    try {
        return await axios.get(txurl + 'pyqwenan' + '/index', { params })
    } catch (error) {
        console.error(error)
    }
}




/*********函数区**********/
function sendMessage(senddata) { //发送消息
    var options = {
        url: url,
        path: path,
        method: 'POST',
        body: JSON.stringify(senddata)
    };
    request.post(options);
}

function receiveMoney(senddata) { //接收转账
    var options = {
        url: url,
        path: path,
        method: 'POST',
        body: JSON.stringify(senddata)
    };
    request.post(options)
}

function agreeFriend(senddata) { //通过好友申请
    var options = {
        url: url,
        path: path,
        method: 'POST',
        body: JSON.stringify(senddata)
    };
    request.post(options)
}

function getUserinfo(senddata) { //获取用户信息
    var options = {
        url: api + "/getWx_userinfo",
        path: path,
        method: 'POST',
        body: JSON.stringify(senddata)
    };
    request.post(options, function (error, response, body) {
        if (error) {
            console.log(error);
            return;
        }
        var data = JSON.parse(body);
        console.log(data.message[0].invite_wxid);
    })
}


function searchUserinfo(senddata) { //在好友列表搜索好友的信息,匹配用户名称并返回wxid
    var options = {
        url: url,
        path: path,
        method: 'POST',
        body: JSON.stringify({
            "type": "Q0005",
            "data": {
                "type": "1"
            }
        })
    };
    request.post(options, function (error, response, body) {
        if (error) {
            console.log(error);
            return;
        }
        var data = JSON.parse(body).result;

        for (let index = 0; index < data.length; index++) {
            if (data[index].nick == senddata.nickname) {
                setInvite({ wxid: data[index].wxid, invite_wxid: senddata.invite_wxid });
            }

        }
    })
}

function searchWxid(wxid) { //在好友列表搜索好友的信息,匹配用户名称并返回wxid
    var options = {
        url: url,
        path: path,
        method: 'POST',
        body: JSON.stringify({
            "type": "Q0005",
            "data": {
                "type": "1"
            }
        })
    };
    request.post(options, function (error, response, body) {
        if (error) {
            console.log(error);
            return;
        }
        var data = JSON.parse(body).result;

        for (let index = 0; index < data.length; index++) {
            if (data[index].wxid == wxid) {
                console.log(data[index].nick);

            }

        }
    })
}



module.exports = route;