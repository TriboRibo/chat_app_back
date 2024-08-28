
module.exports = (res, success, message, data) => {
	return res.send({success, message, data})
}