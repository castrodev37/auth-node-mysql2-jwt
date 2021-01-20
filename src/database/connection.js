module.exports = async ()=>{
  if(global.connection && global.connection.state !== 'disconnected')
    return global.connection

  const mysql = require('mysql2/promise')
  
  const connection = await mysql.createConnection(`mysql://root@localhost:3306/nodemysql`)
  
  console.log('DB connected!');
  
  global.connection = connection
  
  return connection 
}

