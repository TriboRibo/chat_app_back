const User = require('../schemas/userSchema')
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

			//fetch the updated users
			// const users = await User.find()
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
			const user = await User.findOne({name: name})
			if (!user) {
				return res.status(404).json({success: false, error: 'User not found.'})
			}
			//compare provided password
			const isPasswordMatch = await bcrypt.compare(password, user.password)
			if (!isPasswordMatch) {
				return res.status(401).json({success: false, error: 'Password do not match.'})
			}
			const token = jwt.sign({userId: user._id, username: user.name}, process.env.JWT_KEY)
			return res.status(200).json({success: true, token, data: {
					id: user._id,
					username: user.name,
				},
				message: 'Logged in successfully.'
			})
		} catch (error) {
			console.error('kazkokia klaida su login', error)
			return res.status(500).json({success: false, error: error.message})
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
	}
}