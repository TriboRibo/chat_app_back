const User = require('../schemas/userSchema')
const PublicMessage = require('../schemas/publicMessageSchema')
const Room = require('../schemas/roomSchema')
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

			return res.status(200).json({
				success: true, token, data: {
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
	changeUsername: async (req, res) => {
		const {userId, name} = req.body
		try {
			const currentUser = await User.findById(userId)
			if (!currentUser) {
				return res.status(404).json({success: false, error: 'User does not exist.'})
			}
			const existingUser = await User.findOne({name})
			if (existingUser) {
				return res.status(400).json({success: false, error: 'Username already exists'})
			}
			if (currentUser.name === name) {
				return res.status(400).json({success: false, error: 'New username is the same as the current one.'})
			}
			const user = await User.findByIdAndUpdate(userId, {name: name}, {new: true})

			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{name: name},
				{new: true}
			)
			if (!updatedUser) {
				return res.status(404).json({success: false, error: 'User not found.'});
			}

			const io = req.app.get('io')
			io.emit('userListUpdate', {
				id: updatedUser._id,
				username: updatedUser.name,
				avatar: updatedUser.avatar,
			});
			io.emit('connectedUsersUpdate', {
				id: updatedUser._id,
				username: updatedUser.name,
				avatar: updatedUser.avatar,
			});
			return res.status(200).json({
				success: true,
				message: 'Username changed successfully.',
				data: {
					id: updatedUser._id,
					name: updatedUser.name,
					avatar: updatedUser.avatar,
				}
			});
		} catch (error) {
			console.error('Error updating username:', error);
			res.status(500).json({success: false, error: 'An error occurred while updating the username.'});
		}
	},
	changePassword: async (req, res) => {
		const {userId, newPassword} = req.body
		if (!userId || !newPassword) {
			return res.status(400).json({success: false, error: 'User ID and new password are required.'})
		}
		try {
			const user = await User.findByIdAndUpdate(userId, {password: newPassword}, {new: true})
			if (!user) {
				return res.status(404).json({success: false, error: 'User not found.'})
			}

			const isSamePassword = await bcrypt.compare(newPassword, user.password)
			if (isSamePassword) {
				return res.status(400).json({
					success: false,
					error: 'New password cannot be the same as the current password.'
				})
			}
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt)
			await user.save()
			return res.status(200).json({success: true, message: 'Password changed successfully.'})
		} catch (error) {
			console.error('Error updating password:', error);
			return res.status(500).json({success: false, error: error.message});
		}
	},
	changeAvatar: async (req, res) => {
		const {userId, newAvatar} = req.body
		if (!userId || !newAvatar) {
			return res.status(400).json({success: false, error: 'User ID and new avatar are required.'})
		}
		try {
			const user = await User.findByIdAndUpdate(userId, {avatar: newAvatar}, {new: true})
			if (!user) {
				return res.status(404).json({success: false, error: 'User not found.'})
			}
			user.avatar = newAvatar
			await user.save()
			const io = req.app.get('io')
			io.emit('userListUpdate', {
				id: user._id,
				username: user.name,
				avatar: user.avatar,
			});
			io.emit('connectedUsersUpdate', {
				id: user._id,
				username: user.name,
				avatar: user.avatar,
			});
			return res.status(200).json({
				success: true,
				message: 'Avatar updated successfully.',
				data: {id: user._id, name: user.name, avatar: user.avatar}
			})
		} catch (error) {
			return res.status(500).json({success: false, error: error.message})
		}
	},
	createRoom: async (req, res) => {
		const {name} = req.body;
		try {
			const existingRoom = await Room.findOne({name});
			if (existingRoom) {
				return res.status(400).json({message: 'Room already exists'});
			}
			const room = new Room({name});
			await room.save();
			res.status(201).json(room);
		} catch (error) {
			res.status(500).json({message: error.message});
		}
	},
	getRoom: async (req, res) => {
		try {
			const rooms = await Room.find();
			res.status(200).json(rooms);
		} catch (error) {
			res.status(500).json({message: error.message});
		}
	},
	getRoomDetails: async (req, res) => {
		const { roomName } = req.params; // Use roomName from request parameters
		try {
			// Find the room by its name
			const room = await Room.findOne({ name: roomName }).populate('participants').exec();
			if (!room) {
				return res.status(404).json({ message: 'Room not found' });
			}

			// Respond with room details
			res.status(200).json({
				messages: room.messages,
				participants: room.participants
			});
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}


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