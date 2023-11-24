// 消费接口
const { query } = require('./asyncdb')
const moment = require('moment');

async function cost(wxid, cost) {
    let sql = `select * from user where wxid='${wxid}'`
    let dataList = await query(sql)
    // console.log(dataList);
    if (dataList.length == 0) {
        return '余额不足,不能调用'
    } else {
        if (dataList[0].role == 'admin') {
            return 0
        } else {
            let count = dataList[0].count
            let off = dataList[0].off
            cost *= off
            if (count < cost) {
                return '余额不足,不能调用'
            } else {
                let newcount = (count - cost).toFixed(2);
                let sql = `update user set count=${newcount} where wxid='${wxid}'`
                let dataList = await query(sql)
                return 0
            }
        }

    }
}
// 充值接口

async function recharge(wxid, name, wCount) {
    let sql = `select * from user where wxid='${wxid}'`
    let dataList = await query(sql)
    // console.log(dataList);
    if (dataList.length == 0) {
        return '您不在花名册内!'
    } else {
        if (dataList[0].role == 'admin') {
            // let sql = `update user set count=${newcount} where wxid='${wxid}'`
            // let dataList = await query(sql)
            let sql = `select * from user where name='${name}'`
            let ydataList = await query(sql)
            if (ydataList.length == 0) {
                return '查无此人!'
            } else {
                let ycount = Number(ydataList[0].count) + Number(wCount)
                let sqlA = `update user set count=${ycount} where wxid='${ydataList[0].wxid}'`
                let a = await query(sqlA)
                return `充值成功!\n${name}的余额为 ${ycount}`
            }
        } else {
            return '您不是管理员,不能调用!'

        }

    }
}

// 嫖
async function pc(wxid, name, wCount) {
    if (Number(wCount) < 0) {
        return `禁止负嫖!`
    }
    let sql = `select * from user where wxid='${wxid}'`
    let dataList = await query(sql)
    if (dataList.length == 0) {
        return `你不在花名册上, ${name}拒绝了你`
    } else {
        // let success = Math.floor(Math.random() * (10 - 1 + 1)) + 1
        if (dataList[0].count >= Number(wCount)) {
            let sql = `select * from user where name='${name}'`
            let ydataList = await query(sql)
            if (ydataList.length == 0) {
                return '查无此人!'
            } else {
                if (ydataList[0].role == 'admin') {
                    return '禁止与管理员色色'
                } else {
                    let ycount = ydataList[0].count + Number(wCount)
                    let mcount = dataList[0].count - Number(wCount)
                    let sqlA = `update user set count=${ycount} where wxid='${ydataList[0].wxid}'`
                    let a = await query(sqlA)
                    let sqlB = `update user set count=${mcount} where wxid='${dataList[0].wxid}'`
                    let b = await query(sqlB)
                    return `您成功 不可描述 了${name}一下! 并扔下 $${wCount} 离去\n您的积分为 ${mcount}\n ${name}的积分为 ${ycount}\n欢迎下次光临~`
                }

            }
        } else {
            return `你真穷! ${name}拒绝了你.`
        }
    }
    // }
}




module.exports = {
    cost,
    recharge,
    pc
}