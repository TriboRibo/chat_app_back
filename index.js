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
const io = socketIo(Server)
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
app.use(cors())
app.use(express.json())
//Here routes above
app.use('/', mainRoutes)
//Socket io logic
io.on('connection', (socket) => {
	console.log('New socket connection')
	socket.on('disconnect', () => {
		console.log('Client disconnected')
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
