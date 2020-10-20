const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const _ = require('lodash');
const VERIFICATION_LIFE = process.env.VERIFICATION_LIFE || 86400

const verificationSchema = new mongoose.Schema({
	_userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: { unique: true } },
	token: { type: String, required: true },
	createdAt: { type: Date, required: true, default: Date.now, expires: VERIFICATION_LIFE }
});

verificationSchema.plugin(uniqueValidator, { message: 'User verification was already sent!' });

verificationSchema.methods.toJSON = function () {
	const obj = this.toObject()
	return _.omit({ ...obj, id: obj._id }, ['_id', '_userId', '__v']);
}

module.exports = mongoose.model('Verification', verificationSchema);