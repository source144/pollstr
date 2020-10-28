const { Poll, validatePoll, validatePasscode } = require('../models/Poll');
const { Vote, validateVote } = require('../models/Vote');
const { User } = require('../models/User');
// const { Option, validateOption } = require('../models/Option');
const { errorObject } = require('../shared/util');
const { ValidationError } = require('../shared/ValidationError');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

const PERCENT_CHANGE_TRIGGER = process.env.PERCENT_CHANGE_TRIGGER || 1;

// ********************** //
// *** Authentication *** //
// ********************** //
const withUserId = (req, res, next) => {
	if (req.user) {
		User.findOne({ email: req.user.email }, function (err, user) {
			if (err) return res.status(500).send(errorObject(err.message));
			if (!user) return res.status(404).send(errorObject('User does not exist'));
			if (!user.verified) return res.status(426).send(errorObject('User verification needed'));
			req.user.id = user._id;
			req.user.role = user.role;
			next();
		});
	} else next();
}

// ************* //
// *** Polls *** //
// ************* //
/**
 * @swagger
 *  /api/poll/:
 *    post:
 *      tags:
 *        - Poll
 *      description: Creates a new poll for a user or guest
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: Poll
 *          description: Poll Information
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Poll'
 * 
 *      responses:
 *        201:
 *          description: Poll created successfully
 *        500:
 *          description: Server Side Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Credentials don't match
 *        404:
 *          description: User not found
 *        426:
 *          description: User is not verified yet
 */
router.post('/', withUserId, (req, res) => {
	const { error } = validatePoll(req.body);
	if (error) return res.status(400).send({ error, message: error.details[0].message });

	req.body._creator = req.user && req.user.id;
	const poll = new Poll(req.body);
	poll.save(function (err) {
		if (err) {
			console.log('error');
			return res.status(500).send({ error: err, message: err.message });
		}
		console.log('here');
		return res.status(201).send(poll);
	})
});

/**
 * @swagger
 *  /api/poll/{id}/passcode:
 *    put:
 *      tags:
 *        - Poll
 *      description: Updates a poll's passcode
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Poll Id
 *          in: path
 *          required: true
 *        - name: Option Id
 *          description: Option Id
 *          in: path
 *          required: true
 *        - name: Updated Poll Passcode
 *          description: Updated Poll Passcode (empty to remove passcode)
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Passcode'
 * 
 *      responses:
 *        200:
 *          description: Poll passcode updated
 *        500:
 *          description: Server Side Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Must be logged in to modify poll passcode
 *        403:
 *          description: User is not poll creator (can't modify poll passcode)
 *        404:
 *          description: Poll does not exist
 *        426:
 *          description: User is not verified yet
 */
router.put('/:id/passcode', withUserId, (req, res) => {
	if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to modify poll passcode'));

	Poll.findOne({ _id: req.params.id }, function (err, poll) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!poll) return res.status(404).send(errorObject('Poll does not exist'));
		if (poll._creator != req.user.id && req.user.role !== 'admin')
			return res.status(403).send(errorObject('Only poll creators are permitted to modify their poll'));

		poll.passcode = !req.body.passcode ? undefined : req.body.passcode;
		poll.save(function (err) {
			if (err) return res.status(500).send(err);
			return res.status(200).send({ message: "Poll's passcode updated" })
		});
	})
});

/**
 * @swagger
 *  /api/poll/{id}/passcode:
 *    delete:
 *      tags:
 *        - Poll
 *      description: Removes poll's passcode
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Poll Id
 *          in: path
 *          required: true
 * 
 *      responses:
 *        200:
 *          description: Poll passcode updated
 *        500:
 *          description: Server Side Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Must be logged in to modify poll passcode
 *        403:
 *          description: User is not poll creator (can't modify poll passcode)
 *        404:
 *          description: Poll does not exist
 *        426:
 *          description: User is not verified yet
 */
router.delete('/:id/passcode', withUserId, (req, res) => {
	if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to modify poll passcode'));

	Poll.findOne({ _id: req.params.id }, function (err, poll) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!poll) return res.status(404).send(errorObject('Poll does not exist'));

		console.log("Creator: ", poll._creator);
		console.log("User: ", req.user.id);

		if (poll._creator != req.user.id && req.user.role !== 'admin')
			return res.status(403).send(errorObject('Only poll creators are permitted to modify their poll'));

		poll.passcode = undefined;
		poll.save(function (err) {
			if (err) return res.status(500).send({ err, message: err.message });
			return res.status(200).send({ message: "Poll's passcode removed" })
		});
	})
});


// TODO : delete a poll (administartor/creator) or error if poll does not exist
/**
 * @swagger
 *  /api/poll/{id}/passcode:
 *    delete:
 *      tags:
 *        - Poll
 *      description: Delete a Poll
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Poll Id
 *          in: path
 *          required: true
 * 
 *      responses:
 *        200:
 *          description: Poll deleted
 *        500:
 *          description: Server Side Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Must be logged in to delete a poll
 *        403:
 *          description: User is not poll creator (can't delete poll)
 *        404:
 *          description: Poll does not exist
 *        426:
 *          description: User is not verified yet
 */
router.delete('/:id', withUserId, (req, res) => {
	if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to delete a poll'));

	Poll.findOne({ _id: req.params.id }, function (err, poll) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!poll) return res.status(404).send(errorObject('Poll does not exist'));
		if (poll._creator != req.user.id) return res.status(403).send(errorObject('Only poll creators are permitted to delete their poll'));

		poll.passcode = undefined;
		poll.remove(function (err) {
			if (err) return res.status(500).send(err);
			return res.status(204).send()
		});
	})
});

// TODO : validate request body for poll information
/**
 * @swagger
 *  /api/poll/{id}/passcode:
 *    put:
 *      tags:
 *        - Poll
 *      description: Delete a Poll
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Poll Id
 *          in: path
 *          required: true
 *        - name: Poll
 *          description: Poll Information
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Poll'
 * 
 *      responses:
 *        200:
 *          description: Poll deleted
 *        500:
 *          description: Server Side Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Must be logged in to delete a poll
 *        403:
 *          description: User is not poll creator (can't delete poll)
 *        404:
 *          description: Poll does not exist
 *        426:
 *          description: User is not verified yet
 */
router.put('/:id', withUserId, (req, res) => {
	const { error } = validatePoll(req.body);
	if (error) return res.status(400).send({ error, message: error.details[0].message });
	if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to modify poll'));

	Poll.findOne({ _id: req.params.id }, function (err, poll) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!poll) return res.status(404).send(errorObject('Poll does not exist'));
		if (poll._creator != req.user.id && req.user.role !== 'admin')
			return res.status(403).send(errorObject('Only poll creators are permitted to modify their poll'));

		// TODO : logic to check if transaction (save is needed)
		// TODO : or respond with no changes needed..

		poll.passcode = !req.body.passcode ? undefined : req.body.passcode;
		poll.title = req.body.title;
		poll.description = req.body.description;
		poll.tags = req.body.tags;
		poll.public = req.body.public;
		poll.usersOnly = req.body.usersOnly;
		poll.timeToLive = req.body.timeToLive;

		poll.save(function (err) {
			if (err) return res.status(500).send(err);
			return res.status(200).send({ message: "Poll infomration updated" })
		});
	})
});

/**
 * @swagger
 *  /api/poll/{id}:
 *    get:
 *      tags:
 *        - Poll
 *      description: Fetches a poll that matches an id and the option selected by the user/guest requesting it (if they voted already)
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Poll Id
 *          in: path
 *          required: true
 * 
 *      responses:
 *        200:
 *          description: Login Successful. Returns access token(s) and user information
 *        500:
 *          description: Server Side Error
 *        401:
 *          description: Credentials don't match
 *        426:
 *          description: User is not verified yet.
 */
router.get('/:id', withUserId, (req, res) => {
	// console.log(req.params.id);
	Poll.findOne({ _id: req.params.id }, function (err, poll) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!poll) return res.status(404).send(errorObject('Poll does not exist'));


		// User/guest (or both) identification for query
		let _voteQuery;
		if (req.fingerprint && req.fingerprint.hash) {
			if (req.user && req.user.id) {
				_voteQuery = {
					$or: [
						{ _userId: req.user.id },
						{ _fingerPrint: req.fingerprint.hash }
					]
				};
			}
		} else if (req.user && req.user.id) _voteQuery = { _userId: req.user.id };
		else return res.status(500).send(errorObject("Can't submit vote. Missing guest id and user id."));
		Vote.findOne({ _pollId: poll._id, ..._voteQuery }, function (err, vote) {
			if (err) return res.status(500).send({ err, message: err.message });

			return res.status(200).send({ ...(poll.toJSON()), voted: vote && vote._optionId });
		});
	});
});

/**
 * @swagger
 *  /api/poll/{id}/vote/{optionId}:
 *    post:
 *      tags:
 *        - Poll
 *      description: Vote an option for a poll
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Poll Id
 *          in: path
 *          required: true
 *        - name: optionId
 *          description: The Id of the selected option of this poll
 *          in: path
 *          required: true
 *        - name: Passcode for Poll
 *          description: The Passcode of this Poll (empty if no passcode)
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Passcode'
 * 
 *      responses:
 *        200:
 *          description: Login Successful. Returns access token(s) and user information
 *        500:
 *          description: Server Side Error
 *        401:
 *          description: Credentials don't match
 *        426:
 *          description: User is not verified yet.
 */
router.post('/:id/vote/:optionId', withUserId, (req, res) => {
	// if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to modify poll'));

	Poll.findOne({ _id: req.params.id }, function (err, poll) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!poll) return res.status(404).send(errorObject('Poll does not exist'));

		// TODO : allow creator to vote?
		// if (poll._creator == req.user.id) 
		// return res.status(405).send(errorObject('Poll creators aren't allowed to vote on their polls'));

		// Check if user is permitted to vote on this poll
		if (poll.usersOnly && (!req.user || !req.user.id))
			return res.status(403).send(errorObject('Only registered users are allowed to vote on this poll'));

		// Vote submission procedure
		const submitVote = () => {
			let _voteQuery;

			// User/guest (or both) identification for query
			if (req.fingerprint && req.fingerprint.hash) {
				if (req.user && req.user.id) {
					_voteQuery = {
						$or: [
							{ _userId: req.user.id },
							{ _fingerPrint: req.fingerprint.hash }
						]
					};
				}
			} else if (req.user && req.user.id) _voteQuery = { _userId: req.user.id };
			else return res.status(500).send(errorObject("Can't submit vote. Missing guest id and user id."));

			// Find if user/guest have already voted on this poll
			Vote.findOne({ _pollId: poll._id, ..._voteQuery }, function (err, vote) {
				if (err) return res.status(500).send({ err, message: err.message });
				if (vote) return res.status(405).send({ message: "Voting is only allowed once" });

				const _voteModel = {
					_pollId: poll._id,
					_optionId: req.params.optionId,
					_fingerPrint: req.fingerprint.hash,
				};
				if (req.user && req.user.id) _voteModel._userId = req.user.id;

				// User/guest is permitted to vote!
				vote = new Vote(_voteModel)

				vote.save(function (err) {
					if (err) {
						if (err instanceof ValidationError) { console.log('Vote - validation error\n,', vote); return res.status(400).send({ err: err, message: err.message, vote: vote.toJSON() }); }
						// if (err instanceof ValidationError) { console.log('Vote - validation error'); return res.status(400).send({ message: err.message }); }
						return res.status(500).send({ err, message: err.message });
					}

					const option = _.find(poll.options, function (option) { return option._id && req.params.optionId && option._id.toString() == req.params.optionId });
					const _preUpdatePercent = !poll.total_votes || !option ? 0 : (option.votes / poll.total_votes) * 100;

					// Emit live update with sockets
					// TODO : fix inefficiency
					Poll.findOne({ _id: req.params.id }, function (err, poll) {
						if (!err && poll) {

							const option = _.find(poll.options, function (option) { return option._id && req.params.optionId && option._id.toString() == req.params.optionId });
							const _postUpdatePercent = !poll.total_votes || !option ? 0 : (option.votes / poll.total_votes) * 100;


							if (Math.abs(_postUpdatePercent - _preUpdatePercent) >= PERCENT_CHANGE_TRIGGER) {
								console.log(`[${poll._id}] emitting `, { total_votes: poll.total_votes, options: poll.toJSON().options });
								if (res.io.in(req.params.id)) res.io.in(req.params.id).emit(`update_${poll._id}`, { total_votes: poll.total_votes, options: poll.toJSON().options })
								else console.log('failed to emit!')
							}
						}
						return res.status(201).send({ ...(poll.toJSON()), voted: req.params.optionId });
					});
				});
			});
		};

		// Check if guest/user provided a correct passcode (if needed)
		if (poll.passcode) {
			if (!req.body.passcode)
				return res.status(401).send(errorObject('This poll requires a passcode to vote'));

			poll.comparePasscode(req.body.passcode, function (err, isMatch) {
				if (err || !isMatch)
					return res.status(401).send(errorObject('Poll passcode is incorrect'));

				submitVote();
			});
		}
		else submitVote();
	})
});


module.exports = router;
