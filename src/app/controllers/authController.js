const db = require('../../database/connection')
const jwt = require('jsonwebtoken')
const authCfg = require('../../config/auth.json')

function setToken(params={}){
  return jwt.sign(params, authCfg.secret, {
    expiresIn: 7200 // * 1 hora
  })
}

module.exports = {
  
  async createUser(req, res){  
    const conn = await db()

    try {
      const [row] = await conn.query('SELECT email FROM users WHERE email=?', [req.body.email])

      if(row[0]) 
        return res.json({error: 'User already exists...'})

      const hash = await bcrypt.hash(req.body.password, 10)
      // ? name, email, password, passwordResetToken, expiresResetPassword, createdAt'
      const values = [req.body.name, req.body.email, hash]
      const sql = 'INSERT INTO users(name, email, password) VALUES(?,?,?)'
      const [rows] = await conn.query(sql, values)

      return res.json({
        id: rows.insertId,
        token: setToken({id: rows.insertId})
      })
      
    } catch (e) {
      return res.status(400).json({error: e.message})      
    }
  },

  // async createDB(req, res){
  //   const conn = await db()
  //   try {
  //     const [rows] = await conn.query('CREATE DATABASE IF NOT EXISTS ??', [req.body.db])
  //     if(rows.affectedRows) return res.json({info: `DB ${req.body.db} created!`})
  //     return res.json({msg: 'DB has exists...'})

  //   } catch (e) {
  //     return res.status(400).json({error: e.message})
  //   }
  // },

  // async createTable(req, res){
  //   const conn = await db()
  //   const sql = 'CREATE TABLE IF NOT EXISTS users (id int AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL, passwordResetToken VARCHAR(255), expiresResetPassword VARCHAR(255), createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP)'

  //   try {
  //     const [rows] = await conn.query(sql)
  //     res.json({rows: rows})

  //   } catch (e) {
  //     return res.status(400).json({error: e.message})
  //   }
  // }
}