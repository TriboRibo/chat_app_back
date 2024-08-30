const express = require('express')
const Router = express.Router()

const {
	register,
	logIn,
	getAllUsers,
	getSingleUser,
	sendPublicMessage,
	getPublicMessage,
	// sendMessageToUser,
	// receiveMessageFromUser
} = require('../controllers/mainController')

const {
	registerValidation,
	logInValidation,
} = require('../middleware/validation')
//User routes
Router.post('/registerNewUser', registerValidation, register)
Router.post('/login', logInValidation, logIn)
Router.get('/getAllMembers', getAllUsers)
Router.get('/getUser/:name', getSingleUser)
//messaging routes
Router.post('/messages', sendPublicMessage)
Router.get('/messages', getPublicMessage)
// Router.post('/send-message', sendMessageToUser)
// Router.get('/messages/:senderName/', receiveMessageFromUser)
module.exports = Router