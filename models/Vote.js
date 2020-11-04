const mongoose = require('mongoose');
const { User } = require('./User');
const { Poll } = require('./Poll');
const _ = require('lodash');
const Joi = require('joi');
const moment = require('moment');
const { ValidationError } = require('../shared/ValidationError');
const { emitPollData } = require('../index');


const VoteSchema = new mongoose.Schema({
	_pollId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Poll" },
	_optionId: { type: mongoose.Schema.Types.ObjectId, required: true },
	_userId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: "User" },
	_visitorId: { type: String, required: false },
	_fingerPrint: { type: String, required: false },
	createDate: { type: Date, required: true, default: Date.now },
});

VoteSchema.methods.toJSON = function () {
	const obj = this.toObject();

	// return _.pick({ ...obj, id: obj._id }, ['id', '_pollId', '_optionId', 'createDate']);
	return _.omit({ ...obj, id: obj._id }, ['_id', '__v', '_userId', '_visitorId', '_fingerPrint']);
}

// Validate that vote has a guest identification (fingerprint)
// or user identification. It could have both, but it must have
// at least one idenfication form.
// Also validate poll's existence by looking up the _pollId.
// At the same time, look if the optionId is valid.
VoteSchema.pre('validate', function (next) {
	var vote = this;

	if (!mongoose.Types.ObjectId.isValid(vote._pollId)) return next(new ValidationError('Vote invalid, the Poll associated has an invalid Id.'))
	if (!mongoose.Types.ObjectId.isValid(vote._optionId)) return next(new ValidationError('Vote invalid, the Selected Poll Option has an invalid Id.'))
	if (vote._userId && !mongoose.Types.ObjectId.isValid(vote._userId)) return next(new ValidationError('Vote invalid, the User associated with this vote has an invalid Id.'))

	const verifyPoll = () => {
		Poll.findOne({ _id: vote._pollId }, function (err, poll) {
			if (err) return next(new ValidationError(`Failed to validate Poll - ${err.message}`));
			if (!poll) return next(new ValidationError('Vote invalid, the Poll associated with this vote does not exist.'));
			// if (!poll) vote.invalidate('_pollId', 'Vote invalid, the Poll associated with this vote does not exist.')

			// moment().diff(moment(dt))
			// Check if Poll expired
			if (poll.timeToLive > 0 && poll.timeToLive - (moment().unix() - moment(poll.createDate).unix()) < 0)
				return next(new ValidationError('Poll has expired, voting is disabled.'))

			// check if optionId exists in poll
			if (!_.find(poll.options, function (option) { return option._id.toString() === vote._optionId.toString() }))
				return next(new ValidationError('Vote invalid, the selected Option is not associated with the specified poll'));

			else return next();
		});
	}

	if (!vote._userId && !vote._fingerPrint && !vote._visitorId) {
		return next(new ValidationError('A guest Vote must have a guest fingerprint for identification'));
		// vote.invalidate('_fingerPrint', 'Vote must have a user fingerprint for identification if userId is not included')
	}

	if (vote._userId) {
		User.findOne({ _id: vote._userId }, function (err, user) {
			if (err) return next(new ValidationError(`Failed to validate User - ${err.message}`));
			if (!user) return next(new ValidationError('Vote invalid, the User associated with this vote does not exist.'));
			// if (!user) vote.invalidate('_userId', 'Vote invalid, the User associated with this vote does not exist.')
			verifyPoll();
		});
	} else verifyPoll();

});


// Mongoose stupidity :(
VoteSchema.pre('save', function (next) {
	var vote = this;
	this.wasNew = this.isNew
	return next();
})

// Side effect of creating a (new) vote:
// (1) Update poll's total votes (poll.total_votes)
// (2) Update Option's votes
// (3) Trigger Socket.IO update votes
VoteSchema.post('save', function (doc, next) {
	var vote = this;

	const abort = (message) => {
		console.log('abort()');
		vote.remove(function (err, removed) {
			console.log('abort() remove');
			if (err) { return next(new Error(`Failed to abort vote creation caused to do: ${message}`)) };
			return next(new Error(`${message}`));
		})
	};

	if (vote.wasNew) {
		Poll.findOne({ _id: vote._pollId }, function (err, poll) {
			if (err) abort(`Error finding poll associated with vote - ${err.message}`);
			if (!poll) abort(new Error('Failed to find poll associated with vote'));

			const option = _.find(poll.options, function (option) { return option._id && vote._optionId && option._id.toString() == vote._optionId.toString() });
			if (!option) {
				console.log('should abort..');
				abort('Failed to find poll option associated with vote');
			}

			poll.total_votes = poll.total_votes + 1;
			option.votes = option.votes + 1;

			poll.save(function (err) {
				if (err) return next(err.message);
				return next();
			});
		})

	}
	else {
		return next();
	}
});

function validateVote(vote) {
	const schema = Joi.object({
		_pollId: Joi.string().trim().required(),
		_optionId: Joi.string().trim().required(),
		_userId: Joi.string().trim(),
		_visitorId: Joi.string().trim(),
		_fingerPrint: Joi.string().trim()
	}).or('_userId', '_visitorId', '_fingerPrint');
	return schema.unknown().validate(vote);
}

exports.Vote = mongoose.model('Vote', VoteSchema);
exports.validateVote = validateVote;