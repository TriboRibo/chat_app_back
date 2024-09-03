const mongoose = require('mongoose');
const Schema = mongoose.Schema

const roomSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	messages: {
		type: Array,
		required: true,
		default: [],
	}
})

const Room = mongoose.model('Room', roomSchema)
module.exports = Room