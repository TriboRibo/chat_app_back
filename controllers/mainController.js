const User = require('../schemas/userSchema')
const PublicMessage = require('../schemas/publicMessageSchema')
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
	register: async (req, res) => {
		const {name, password} = req.body;
		try {
			if (!name || !password) {
				return res.status(400).json({success: false, error: 'Name and password are required.'})
			}
			const existingUser = await User.findOne({name})
			if (existingUser) {
				return res.status(400).json({success: false, error: 'Username is exist.'})
			}
			//hash password
			const salt = await bcrypt.genSalt(10);
			const passHash = await bcrypt.hash(password, salt);
			//new user card
			const newUser = new User({
				name: name,
				password: passHash
			})
			await newUser.save();

			//broadcast the updated users
			const io = req.app.get('io')
			io.emit('userListUpdate')

			return res.status(201).json({success: true, message: 'Registered successfully.'})
		} catch (error) {
			console.error('kazkokia klaida prie registracijoss', error)
			return res.status(500).json({success: false, error: error.message})
		}
	},
	logIn: async (req, res) => {
		const {name, password} = req.body;
		try {
			const user = await User.findOne({name})
			if (!user) {
				return res.status(404).json({success: false, error: 'User not found.'})
			}
			//compare provided password
			const isPasswordMatch = await bcrypt.compare(password, user.password)
			if (!isPasswordMatch) {
				return res.status(401).json({success: false, error: 'Password do not match.'})
			}
			const token = jwt.sign({userId: user._id, username: user.name}, process.env.JWT_KEY)

			//broadcast event notify all clients
			const io = req.app.get('io')
			io.emit('connectedUsersUpdate', {
				id: user._id,
				username: user.name,
				avatar: user.avatar,
			})

			return res.status(200).json({success: true, token, data: {
					id: user._id,
					username: user.name,
					avatar: user.avatar
				},
				message: 'Logged in successfully.'
			})
		} catch (error) {
			console.error('Error during login', error)
			return res.status(500).json({success: false, error: 'Internal server error.'})
		}
	},
	getAllUsers: async (req, res) => {
		try {
			const users = await User.find()
			return res.status(200).json({success: true, users})
		} catch (error) {
			console.error('kazkokia klaida su fetchinimu useriu', error)
			return res.status(500).json({success: false, error: error.message})
		}
	},
	getSingleUser: async (req, res) => {
		try {
			const username = req.params.name
			const user = await User.findOne({name: username})
			if (!user) {
				return res.status(404).json({success: false, error: 'User not found.'})
			}
			return res.status(200).json({success: true, user})
		} catch (error) {
			console.error('Error fetching user details', error)
			return res.status(500).json({success: false, error: error.message})
		}
	},
	sendPublicMessage: async (req, res) => {
		const {sender, content} = req.body;
		try {
			const message = new PublicMessage({sender, content})
			await message.save()
			res.status(201).json({success: true, message: 'Message sent successfully.'})
		} catch (error) {
			res.status(500).json({success: false, error: 'Failed to send message.'})
		}
	},
	getPublicMessage: async (req, res) => {
		try {
			const messages = await PublicMessage.find().sort({ timestamp: 1})
			res.status(200).json({success: true, messages})
		} catch (error) {
			res.status(500).json({success: false, error: 'Failed to retrieve messages.'})
		}
	},

	// sendMessageToUser: async (req, res) => {
	// 	const {senderName, receiverName, content} = req.body
	// 	try {
	// 		const message = new Message({
	// 			sender: senderName,
	// 			receiver: receiverName,
	// 			content
	// 		})
	// 		await message.save()
	// 		req.app.get('io').emit('newMessage', {message})
	//
	// 		res.status(200).json({success: true, message: 'Message sent successfully.'})
	// 	} catch (error) {
	// 		res.status(500).json({success: false, message: 'Failed to send message.', error})
	// 	}
	// },
	// receiveMessageFromUser: async (req, res) => {
	// 	const {senderName, receiverName} = req.params
	// 	try {
	// 		const message = await Message.find({
	// 			$or: [
	// 				{sender: senderName, receiver: receiverName},
	// 				{sender: receiverName, receiver: senderName},
	// 			],
	// 		}).sort({timestamp: 1})
	// 		res.status(200).json({success: true, messages})
	// 	} catch (error) {
	// 		res.status(500).json({success: false, message: 'Failed to retrieve messages', error})
	// 	}
	// }
}