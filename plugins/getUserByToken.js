
const jwt = require('jsonwebtoken');  // Add this line at the top of your file
const User = require('../schemas/userSchema');

async function getUserByToken(token) {
	try {
		const decoded = jwt.verify(token, process.env.JWT_KEY);
		const user = await User.findById(decoded.userId);
		return user;
	} catch (error) {
		console.error('Error fetching user by token:', error);
		return null;
	}
}

module.exports = getUserByToken;