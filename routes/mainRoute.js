const express = require('express')
const Router = express.Router()

const {
	register,
	logIn,
	getAllUsers,
	getSingleUser,
} = require('../controllers/mainController')

const {
	registerValidation,
	logInValidation,
} = require('../middleware/validation')

Router.post('/registerNewUser', registerValidation, register)
Router.post('/login', logInValidation, logIn)
Router.get('/getAllMembers', getAllUsers)

Router.get('/getUser/:name', getSingleUser)
module.exports = Router