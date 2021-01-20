const express = require('express')
const routes = express.Router()

const authController = require('./app/controllers/authController')

routes.post('/users', authController.createUser)
routes.post('/users/auth', authController.authUser)
routes.post('/password', authController.forgotPassword)

// ? Para fins didáticos de criação do db e da tabela, pois podem ser criados no workbench 
// routes.post('/db', authController.createDB)
// routes.post('/table', authController.createTable)

module.exports = routes