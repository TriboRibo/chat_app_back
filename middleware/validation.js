module.exports = {
	registerValidation: (req, res, next) => {
		const {name, password, repeatPassword} = req.body

		if (!name || !password || !repeatPassword) {
			let missing = ''
			if (!name) missing += `Nera name`
			if (!password) missing += `Nera password`
			if (!repeatPassword) missing += `Nera repeat password`
			return res.status(400).json({error: `${missing}`})
		}
		if (password !== repeatPassword) {
			return res.status(400).json({error: 'password do not match'})
		}
		next()
	},
	logInValidation: (req, res, next) => {
		const {name, password} = req.body
		if (!name || !password) {
			return res.status(400).json({error: 'all field is required'})
		}
		next()
	}
}