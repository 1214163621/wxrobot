// 签到服务

const { query } = require('./asyncdb')
const moment = require('moment');

async function queryone(wxid) {
  let sql = `select * from user where wxid='${wxid}'`
  let dataList = await query(sql)
  // console.log(dataList);
  return dataList
}


async function update(wxid) {
  let dataList1 = await queryone(wxid)
  if (dataList1.length == 0) {
    let newcount = Math.floor(Math.random() * (40 - 5 + 1)) + 5
    let sql = `insert into user (wxid,count,updatetime) values  ('${wxid}',${newcount},'${moment().format("YYYY-MM-DD HH:mm:ss")}')`
    let dataList = await query(sql)
    return `签到成功\n当前积分为${newcount}`
  } else {
    let updatetime = moment(dataList1[0].updatetime, 'YYYY-MM-DD');
    let nowtime = moment().format('YYYY-MM-DD');
    // let moment2 = moment(nowtime, 'YYYY-MM-DD');
    let sameday = updatetime.isSame(nowtime, 'date');
    if (sameday) {
      return `你今天已经签过到了,当前积分为${dataList1[0].count}`
    } else {
      let newcount = dataList1[0].count + Math.floor(Math.random() * (40 - 5 + 1)) + 5
      let sql = `update user set count=${newcount}, updatetime = '${moment().format("YYYY-MM-DD HH:mm:ss")}' where wxid='${wxid}'`
      let dataList = await query(sql)
      if (dataList.affectedRows > 0) {
        return `签到成功\n当前积分为${newcount}`
      }
    }
  }
}

async function signin(wxid) {
  let msg = await update(wxid)
  return msg
}

async function getcount(wxid) {
  let sql = `select * from user order by count desc`
  let dataList = await query(sql)
  // console.log(dataList);
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].wxid == wxid) {
      return `您当前积分为: ${dataList[i].count}\n排名为${i + 1}`
    }
  }
  return '暂无数据'
}
async function getcountall() {
  let sql = `select * from user where name != 'bot' order by count desc`
  let dataList = await query(sql)
  // console.log(dataList);
  let str = '积分列表'
  for (let i = 0; i < dataList.length; i++) {
    if (dataList[i].name != null && dataList[i].name != '') {
      str += `\n${dataList[i].name} : `
    } else {
      str += `\n${dataList[i].wxid} : `
    }
    str += `${dataList[i].count}`
  }
  return str
}


async function testins(wxid) {
  let sql = `insert into user (wxid) values  ('${wxid}')`
  let dataList = await query(sql)
  // console.log(dataList);
  // let str = '积分列表'
  // for (let i = 0; i < dataList.length; i++) {
  //   if (dataList[i].name != null && dataList[i].name != '') {
  //     str += `\n${dataList[i].name} : `
  //   } else {
  //     str += `\n${dataList[i].wxid} : `
  //   }
  //   str += `${dataList[i].count}`
  // }
  return wxid
}



// async function early(){
//   console.log(123);
// }
const schedule = require('node-schedule');
function scheduleCronstyle(){
    schedule.scheduleJob('3 * * * * *', function(){
        console.log('scheduleCronstyle:' + new Date());
    }); 
}
// scheduleCronstyle()

module.exports = {
  signin,
  getcount,
  getcountall,
  testins
}
// module.exports.signin = async function(wxid) {
//   return signin(wxid)
// }