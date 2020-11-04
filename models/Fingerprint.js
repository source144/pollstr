const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const _ = require('lodash');

// TODO : visitorId TTL??
// const VERIFICATION_LIFE = process.env.VERIFICATION_LIFE || 86400

const fingerprintSchema = new mongoose.Schema({
	// TODO : relate a fingerprint to a single user? probably not..
	_userId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "User" },
	fingerprint: { type: String, required: true, index: { unique: true } },
	createdAt: { type: Date, required: true, default: Date.now }
});

// fingerprintSchema.index({ createdAt: 1 }, { expireAfterSeconds: VERIFICATION_LIFE });
fingerprintSchema.plugin(uniqueValidator, { message: 'Fingerprint already exists' });

fingerprintSchema.methods.toJSON = function () {
	const obj = this.toObject()
	return _.omit({ ...obj, id: obj._id }, ['_id', 'fingerprint', '__v']);
}

exports.Fingerprint = mongoose.model('Fingerprint', fingerprintSchema);