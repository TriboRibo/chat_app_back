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
//store for connected and registered users
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
	//Send the list of connected users to the other users
	socket.emit('connectedUsersUpdate', Object.values(connectedUsers))
	// console.log('connected users:', Object.values(connectedUsers))

	//Notify all users about new user logged in
	socket.on('setUsername', (username) => {
		connectedUsers[socket.id] = username
		//broadcast connected users
		io.emit('connectedUsersUpdate', Object.values(connectedUsers))
		console.log('Logged in', username)
		console.log('Updated connected users:', Object.values(connectedUsers))
	})
	socket.on('disconnect', () => {
		//Remove user from the list when the disconnected
		delete connectedUsers[socket.id]
		//Broadcast updated user list to all clients
		io.emit('connectedUsersUpdate', Object.values(connectedUsers))
		console.log('Client disconnected:', socket.id)
		console.log('Updated connected users:', Object.values(connectedUsers))
	})
})
//Start the server
const PORT = process.env.PORT
Server.listen(PORT, async () => {
	try {
		await connectToMongoD()
		console.log(`Server is running at ${PORT}`)
	} catch (error) {
		console.log('Failed to connect to MongoDb:', error.message)
	}
})
