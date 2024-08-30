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
	},
	avatar: {
		type: String,
		default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
	},
	friendList: {
		type: Array,
		required: true,
		default: []
	}
})

const user = mongoose.model("User", userSchema);
module.exports = user