const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema ({
	name: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	}
})

const user = mongoose.model("User", userSchema);
module.exports = user