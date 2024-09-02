const express = require('express')
const Router = express.Router()

const {
	register,
	logIn,
	getAllUsers,
	getSingleUser,
	// sendPublicMessage,
	// getPublicMessage,
	// sendMessageToUser,
	// receiveMessageFromUser
	changeUsername,
	changePassword,
	changeAvatar
} = require('../controllers/mainController')

const {
	registerValidation,
	logInValidation,
	validateUsername,
	validatePassword,
	validateAvatar
} = require('../middleware/validation')
//User routes
Router.post('/registerNewUser', registerValidation, register)
Router.post('/login', logInValidation, logIn)
Router.get('/getAllMembers', getAllUsers)
Router.get('/getUser/:name', getSingleUser)
//change/update something
Router.post('/changeUsername', validateUsername, changeUsername)
Router.post('/changePassword', validatePassword, changePassword)
Router.post('/changeAvatar', validateAvatar, changeAvatar)
//messaging routes
// Router.post('/messages', sendPublicMessage)
// Router.get('/messages', getPublicMessage)
// Router.post('/send-message', sendMessageToUser)
// Router.get('/messages/:senderName/', receiveMessageFromUser)
module.exports = Router