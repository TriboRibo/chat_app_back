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
		const passwordRegex = /^(?=.*[!@#$%^&*_+])[A-Za-z\d!@#$%^&*_+]{4,20}$/;
		if (!passwordRegex.test(password)) {
			return res.status(400).json({
				error: 'Password must be 4-20 characters long, include at least one special symbol (!@#$%^&*_+).'
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
	}
}