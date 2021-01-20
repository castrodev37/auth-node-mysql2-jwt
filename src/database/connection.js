require('dotenv').config()

module.exports = async ()=>{
  if(global.connection && global.connection.state !== 'disconnected')
    return global.connection

  const mysql = require('mysql2/promise')
  
  const connection = await mysql.createConnection(`mysql://${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`)
  
  console.log('DB connected!');
  
  global.connection = connection
  
  return connection 
}

