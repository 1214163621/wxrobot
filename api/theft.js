// 偷窃
const { query } = require('./asyncdb')
const moment = require('moment');

// 偷窃
async function theft(wxid, name) {
    console.log(name);
    let sql = `select * from user where wxid='${wxid}'`
    let dataList = await query(sql)
    if (dataList.length == 0) {
        return '您不在花名册上, 不能偷窃'
    } else {
        // if (dataList[0].role == 'admin') {
        //     return 0
        // } else {
        let success = Math.floor(Math.random() * (10 - 1 + 1)) + 1
        if (success <= 5) {
            let sql = `select * from user where name='${name}'`
            let ydataList = await query(sql)
            if (ydataList.length == 0) {
                return '查无此人!' 
            } else {
                if(ydataList[0].count - success < 0){
                    success = ydataList[0].count
                }
                let ycount = ydataList[0].count - success
                let mcount = dataList[0].count + success
                let sqlA = `update user set count=${ycount} where wxid='${ydataList[0].wxid}'`
                let a = await query(sqlA)
                let sqlB = `update user set count=${mcount} where wxid='${dataList[0].wxid}'`
                let b = await query(sqlB)
                return `偷窃成功! 您的积分为 ${mcount}\n ${name}的积分为 ${ycount}`
            }
        } else {
            return '你运气真差, 没有偷窃成功~'
        }
    }
    // }
}



module.exports = {
    theft
}