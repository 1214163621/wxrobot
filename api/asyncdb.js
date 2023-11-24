const mysql = require('mysql')
const pool = mysql.createPool({
    host: '39.106.213.80',
    user: 'ctest',
    password: 'YDBpCiXEjPhtyzhK',
    database: 'ctest' // 连接mysql对应的数据库
})

let query = function( sql, values ) {
  return new Promise(( resolve, reject ) => {
    pool.getConnection(function(err, connection) {
      if (err) {
        reject( err )
      } else {
        connection.query(sql, values, ( err, rows) => {

          if ( err ) {
            reject( err )
          } else {
            resolve( rows )
          }
          connection.release()
        })
      }
    })
  })
}

module.exports = { query }