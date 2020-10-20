const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const SALT_WORK_FACTOR = 10;

const pwSchema = Joi.string().min(8).max(24);


var validateEmail = function (email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email)
};

const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		lowercase: true,
		index: { unique: true },
		// unique: true,
		required: 'Email is required',
		validate: [validateEmail, 'A valid email is required'],
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'A valid email is required']
	},
	password: {
		type: String,
		required: true
	},
	firstName: { type: String },
	lastName: { type: String },
	role: { type: String, required: true, default: 'user' },
	verified: { type: Boolean, required: true, default: false },
	createDate: { type: Date, required: true, default: Date.now },
	lastLogin: { type: Date, default: Date.now },
	pollCount: { type: Number, min: 0, default: 0 },
	polls: [mongoose.Schema.Types.ObjectId]
});

// Middleware directly from MongoDB's article
// https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
UserSchema.pre('save', function (next) {
	var user = this;

	// only hash the password if it has been modified (or is new)
	if (!user.isModified('password')) return next();

	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
		if (err) {
			return next(err);
		}
		// hash the password using our new salt
		bcrypt.hash(user.password, salt, function (err, hash) {
			if (err) {
				return next(err);
			}
			// override the cleartext password with the hashed one
			user.password = hash;

			next();
		});
	});
});


UserSchema.methods.comparePassword = function (candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

UserSchema.methods.fullName = function () {
	return [this.firstName, this.lastName].join(' ').trim();
}

UserSchema.plugin(uniqueValidator, { message: 'User {PATH} already exists!' });

function validateUser(user, password = true) {
	const schema = Joi.object({
		email: Joi.string().min(5).required().email(),
		password: password ? pwSchema.required() : pwSchema,
		firstName: Joi.string().trim(),
		lastName: Joi.string().trim()
	});
	return schema.validate(user);
}

function validatePassword(password) {
	return Joi.object({ password: pwSchema.required() }).unknown().validate(password);
}


exports.User = mongoose.model('User', UserSchema);
exports.validate = validateUser;
exports.validatePassword = validatePassword;
// module.exports = [mongoose.model('User', UserSchema), validateUser];