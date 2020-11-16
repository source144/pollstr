const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const Joi = require('joi');
const SALT_WORK_FACTOR = 10;

const pcSchema = Joi.string().trim().min(1).max(24).regex(/^\S+$/);

const hash_tags = searchText => {
	if (!searchText)
		return [];

	var regexp = /(\s|^)\#\w\w+\b/gm
	result = searchText.match(regexp);
	if (result) return result.map(function (s) { return s.trim().replace(/#/gi, ''); });
	else return [];
}
const no_special_chars = (str) => str.replace(/[^\w\s]/gi, '');

const PollSchema = new mongoose.Schema({
	_creator: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "User" },
	_visitorId: { type: String, required: false },
	title: {
		type: String,
		trim: true,
		// unique: true,
		required: 'Title is required',
		minlength: 1,
	},
	description: {
		type: String,
		required: false
	},
	createDate: { type: Date, required: true, default: Date.now },
	// TODO : use moment js to verify time to live is day-hour-min
	timeToLive: { type: Number, min: 0, default: 0, validate: { validator: Number.isInteger, message: '{VALUE} is not an integer value' } },

	passcode: { type: String },

	hideResults: { type: Boolean, required: true, default: true },
	usersOnly: { type: Boolean, required: true, default: false },
	public: { type: Boolean, required: true, default: false },
	autoTags: [String],
	tags: [String],

	options: {
		type: [{
			title: {
				type: String,
				trim: true,
				required: 'Option title is required',
				minlength: 1,
				set: function (val) {
					return val;
				}
			},
			description: {
				type: String,
				required: false,
				set: function (val) {
					return val;
				}
			},
			votes: { type: Number, min: 0, default: 0, required: true, validate: { validator: Number.isInteger, message: '{VALUE} is not an integer value' } }
		}],
		validate: [function (val) { return val.length >= 2 }, "Poll must have at least two options"]
	},
	total_votes: { type: Number, min: 0, default: 0, required: true, validate: { validator: Number.isInteger, message: '{VALUE} is not an integer value' } }
});

PollSchema.methods.toJSON = function () {
	const obj = this.toObject();

	obj.passcode = !!obj.passcode;
	obj.options = obj.options.map(el => _.omit({ ...el, id: el._id }, ['_id']));

	return _.omit({ ...obj, id: obj._id }, ['_id', '_creator', '__v']);
}

// Middleware directly from MongoDB's article
// https://www.mongodb.com/blog/post/password-authentication-with-mongoose-part-1
PollSchema.pre('save', function (next) {
	var poll = this;

	// only hash the password if it has been modified (or is new)
	if (poll.isModified('passcode') && poll.passcode) {
		console.log('passcode was modified');
		// generate a salt
		bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
			if (err) {
				return next(err);
			}
			// hash the passcode using our new salt
			bcrypt.hash(poll.passcode, salt, function (err, hash) {
				if (err) {
					return next(err);
				}
				// override the cleartext passcode with the hashed one
				poll.passcode = hash;
				console.log('Hash: ', hash);
				next();
			});
		});
	}
	else next();
});
PollSchema.pre('save', function (next) {
	var poll = this;
	if (poll.isModified('title') || poll.isModified('description')) {
		poll.autoTags = _.uniq([...hash_tags(poll.title), ...hash_tags(poll.description)])
	}
	if (poll.isModified('tags')) {
		if (Array.isArray(poll.tags)) poll.tags = _.uniq(_.map(poll.tags, tag => no_special_chars(tag)));
		else if (typeof poll === 'string') poll.tags = _.uniq(no_special_chars(poll.tags.replace(/#/gi, ' ')).replace(/\s\s+/g, ' ').trim().split(' '));
		else poll.tags = [];
	}

	return next();
});

PollSchema.methods.comparePasscode = function (candidatePasscode, cb) {
	bcrypt.compare(candidatePasscode, this.passcode, function (err, isMatch) {
		if (err) return cb(err);
		cb(null, isMatch);
	});
};

function validatePoll(poll, passcode) {
	const schema = Joi.object({
		title: Joi.string().trim().min(1).max(50).required(),
		description: Joi.string().trim().min(1),
		timeToLive: Joi.number().integer().min(0),
		passcode: pcSchema,
		hideResults: Joi.bool(),
		usersOnly: Joi.bool(),
		public: Joi.bool(),
		tags: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string()),
		options: Joi.array().items(Joi.object().keys({
			title: Joi.string().min(1).max(50).required(),
			description: Joi.string().min(1).max(50),
		})).min(2).unique('title').required()
	});
	return schema.unknown().validate(poll);
}

function validatePollEdit(poll, passcode) {
	const schema = Joi.object({
		timeToLive: Joi.number().integer().min(0),
		passcode: pcSchema,
		hideResults: Joi.bool(),
		usersOnly: Joi.bool(),
		public: Joi.bool(),
		tags: Joi.alternatives(Joi.array().items(Joi.string()), Joi.string()),
	});
	return schema.unknown().validate(poll);
}

function validatePasscode(passcode) {
	return Joi.object({ passcode: pcSchema.required() }).unknown().validate(passcode);
}

exports.Poll = mongoose.model('Poll', PollSchema);
exports.validatePoll = validatePoll;
exports.validatePollEdit = validatePollEdit;
exports.validatePasscode = validatePasscode;