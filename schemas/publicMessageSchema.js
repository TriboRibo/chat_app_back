const mongoose = require('mongoose');
const Schema = mongoose.Schema

const publicMessageSchema = new Schema({
	sender: {
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
	}
})

const publicMessage = mongoose.model('PublicMessage', publicMessageSchema)
module.exports = publicMessage