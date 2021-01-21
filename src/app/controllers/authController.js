const db = require('../../database/connection')
const jwt = require('jsonwebtoken')
const authCfg = require('../../../config/auth.json')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')
const { send } = require('process')

function setToken(params={}){
  return jwt.sign(params, authCfg.secret, {
    expiresIn: 7200 // * 2 horas
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

  async authUser(req, res){
    const conn = await db()
    try {
      const [row] = await conn.query('SELECT * FROM users WHERE email=?', [req.body.email])
      
      if(!row[0]) return res.status(400).json({error: 'User not found...'})
      if(!await bcrypt.compare(req.body.password, row[0].password ))
        return res.status(400).json({error: 'Invalid password...'})

      row[0].password = undefined

      return res.json({
        user: row[0],
        token: setToken({ id: row[0].id })
      })

    } catch (e) {
      return res.status(400).json({error: e.message})   
    }
  },

  async forgotPassword(req, res){
    const conn = await db()
    
    try {
      const [checkUser] = await conn.query('SELECT * FROM users WHERE email=?', [req.body.email]) 
      if(!checkUser) return res.status(400).json({error:'User not found...'})

      const token = crypto.randomBytes(20).toString('HEX')
      const now = new Date()
      now.setMinutes(now.getMinutes() + 30)

      const fillUpPassAndExpFields = await conn.query('UPDATE users SET passwordResetToken=?, expiresResetPassword=? WHERE id=?', [token, now, checkUser[0].id ])
      
      mailer.sendMail({
        to: req.body.email,
        from: 'foo@contact.com',
        template: 'main',
        context: { token }
        
      }, err=>{
        if(err) return res.status(400).send({error: 'There was an internal error. Please, try again.'})
        return res.send()
      })

    } catch (e) {
      return res.status(400).send({error: 'Operation doesn\'t work. Please, try again.'})
    }
  },

  async resetPassword(req, res){
    const conn = await db()
    try {
      const [ chkUsrToResPwd ] = await conn.query('SELECT * FROM users WHERE email=?', [req.body.email])

      if(!chkUsrToResPwd[0]) return res.status(400).send({error:'User not found...'})
      
      if(req.body.token !== chkUsrToResPwd[0].passwordResetToken)
        return res.status(400).send({error:'Token invalid...'})
      const tmExpComp = new Date()
      
      if(tmExpComp > chkUsrToResPwd[0].expiresResetPassword)
        return res.status(400).send({error:'Expired token...'})

      await conn.query('UPDATE users SET password=? WHERE id=?', [req.body.password, chkUsrToResPwd[0].id])

      return res.send({response: 'Password changed successfuly!'})

    } catch (e) {
      return res.status(400).send({error:'Operation failed. Please, try again.'})
    }
  }

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