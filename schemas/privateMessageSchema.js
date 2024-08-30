const mongoose = require('mongoose');
const Schema = mongoose.Schema

const privateMessageSchema = new Schema({
	sender: {
		type: String,
		required: true,
	},
	receiver: {
		type: String,
		required: true,
	},
	content: {
		type: String,
		required: true,
	},
	timestamp: {
		type: Date,
		default: Date.now,
	},
	isRead: {
		type: Boolean,
		default: false,
	}
})

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema)
module.exports = PrivateMessage