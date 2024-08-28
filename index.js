const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const cors = require('cors')
const mongoose = require('mongoose')
const mainRoutes = require('./routes/mainRoute')
require('dotenv').config()

const app = express()
//Create a server and attach socket to it
const Server = http.createServer(app)
const io = socketIo(Server, {
	cors: {
		origin: 'http://localhost:5173',
		method: ['GET', 'POST']
	}
})
//store for connected users
const connectedUsers = {}
//DB connection
const connectToMongoD = async () => {
	try {
		await mongoose.connect(process.env.MONGO_KEY)
		console.log('Connected to MongoDB')
	} catch (error) {
		console.log('Error connecting to MongoDb', error.message)
	}
}
//io accessible to routes
app.set('io', io)
//middleware setup
app.use(cors({
	origin: 'http://localhost:5173',
	method: ['GET', 'POST']
}))
app.use(express.json())
//Here routes above
app.use('/', mainRoutes)
//Socket io logic
io.on('connection', (socket) => {
	console.log('New socket connection:', socket.id)
	socket.on('setUsername', (username) => {
		connectedUsers[socket.id] = username
		const userList = Object.values(connectedUsers)
		//broadcast updated use list to all clients
		io.emit('userListUpdate', userList)
		//notify the new user of the current user list
		socket.emit('userListUpdate', userList)
		console.log('user List updated:', userList)
	})
	socket.on('disconnect', () => {
		//Remove user from the list when the disconnected
		delete connectedUsers[socket.id]
		const userList = Object.values(connectedUsers)
		//Broadcast updated user list to all clients
		io.emit('userListUpdate', userList)
		console.log('Client disconnected', socket.id)
		console.log('updated userList:', userList)
	})
})
//Start the server
const PORT = process.env.PORT || 3000
Server.listen(PORT, async () => {
	try {
		await connectToMongoD()
		console.log(`Server is running at ${PORT}`)
	} catch (error) {
		console.log('Failed to connect to MongoDb:', error.message)
	}
})
