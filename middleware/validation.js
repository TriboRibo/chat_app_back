const User = require('../schemas/userSchema');

module.exports = {
	registerValidation: (req, res, next) => {
		const {name, password, repeatPassword} = req.body

		if (!name || !password || !repeatPassword) {
			let missing = ''
			if (!name) missing += `Username must be filled. `
			if (!password) missing += `Password must be filled. `
			if (!repeatPassword) missing += `Password repeat must be filled. `
			return res.status(400).json({error: `${missing}`})
		}
		if (name.length < 4 || name.length > 20) {
			return res.status(400).json({error: 'Username must be between 4 and 20 characters.'})
		}
		if (password !== repeatPassword) {
			return res.status(400).json({error: 'Passwords must be match.'})
		}
		const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*_+])[A-Za-z\d!@#$%^&*_+]{4,20}$/
		if (!passwordRegex.test(password)) {
			return res.status(400).json({
				error: 'Password must be 4-20 characters long, include at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*_+), and may contain digits.'
			});
		}
		next()
	},
	logInValidation: (req, res, next) => {
		const {name, password} = req.body
		if (!name || !password) {
			return res.status(400).json({error: 'All field are required.'})
		}
		next()

	},
	validateUsername: (req, res, next) => {
		const {name} = req.body
		if (!name || typeof name !== "string")  {
			return res.status(400).json({success: false, error: 'Invalid username'})
		}
		if (name.length < 4 || name.length > 20) {
			return res.status(400).json({error: 'Username must be between 4 and 20 characters.'})
		}
		next()
	},
	validatePassword: (req, res, next) => {
		const {newPassword} = req.body
		const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*_+])[A-Za-z\d!@#$%^&*_+]{4,20}$/
		if (!newPassword || !passwordRegex.test(newPassword)) {
			return res.status(400).json({
				error: 'Password must be 4-20 characters long, include at least one uppercase letter, one lowercase letter, and one special character (!@#$%^&*_+), and may contain digits.'
			})
		}
		next()
	},
	validateAvatar: (req, res, next) => {
		const {newAvatar} = req.body
		const urlRegex = /^(https?:\/\/)[\w\-]+(\.[\w\-]+)+[/#?]?.*$/
		if (!newAvatar || typeof newAvatar !== 'string' || !urlRegex.test(newAvatar)) {
			return res.status(400).json({error: 'Avatar must be a valid string URL.'})
		}
		const validImage = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.bmp', '.webp']
		const urlLowerCase = newAvatar.toLowerCase()
		const hasValidExtension = validImage.some(ext => urlLowerCase.endsWith(ext))
		if (!hasValidExtension) {
			return res.status(400).json({error: 'Avatar URL must point to a valid image format (e.g., .jpg, .png).'})
		}
		next()
	}
}