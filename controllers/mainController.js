const User = require('../schemas/userSchema')
const bcrypt = require("bcrypt");

module.exports = {
	register: async (req, res) => {
		const {name, password} = req.body;
		try {
			const existingUser = await User.findOne({ name })
			if (existingUser) {
				return res.status(400).json({success: false, error: 'jau yra name'})
			}
			const newUser = new User ({
				name: name,
				password: password
			})
			await newUser.save()
			return res.status(201).json({success: true, message: 'registered succesfully', newUser})
		} catch (error) {
			console.error('kazkokia klaida', error)
			return res.status(500).json({success: false, error: error.message})
		}
	},
	logIn: async (req, res) => {
		const {name, password} = req.body;
		try {
			const user = await User.findOne({ name })
			if (!user) {
				return res.status(404).json({success: false, error: 'user not found'})
			}
			// const isPasswordMatch = await bcrypt.compare(password, user.password)
			// if (!isPasswordMatch) {
			// 	return res.status(404).json({success: false, error: 'password do not match'})
			// }
			if (password !== user.password) {
				return res.status(400).json({success: false, error: 'password do not match'})
			}
			return res.status(200).json({success: true, message: 'sekmingai prisijungta', user})
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