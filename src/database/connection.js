const config = require('../../config/db.json')

module.exports = async ()=>{
  if(global.connection && global.connection.state !== 'disconnected')
    return global.connection

  const mysql = require('mysql2/promise')
  
  const connection = await mysql.createConnection(`mysql://${config.DB_USER}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_NAME}`)
  
  console.log('DB connected!');
  
  global.connection = connection
  
  return connection 
}

