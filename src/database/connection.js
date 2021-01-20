require('dotenv').config()

module.exports = async ()=>{
  if(global.connection && global.connection.state !== 'disconnected')
    return global.connection

  const mysql = require('mysql2/promise')
  
  const connection = await mysql.createConnection(`mysql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}`)
  
  console.log('DB connected!');
  
  global.connection = connection
  
  return connection 
}

