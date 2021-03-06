const { Poll, validatePoll, validatePasscode } = require('../models/Poll');
const { User } = require('../models/User');

const { errorObject } = require('../shared/util');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

// ********************** //
// *** Authentication *** //
// ********************** //
const withUserId = (req, res, next) => {
	if (req.user) {
		User.findOne({ email: req.user.email }, function (err, user) {
			if (err) return res.status(500).send(errorObject(err.message));
			if (!user) return res.status(404).send(errorObject('User does not exist'));
			if (!user.verified) return res.status(426).send(errorObject('Email verification needed'));
			req.user.id = user._id;
			req.user.role = user.role;
			next();
		});
	} else next();
}

/**
 * @swagger
 *  /api/polls/:
 *    get:
 *      tags:
 *        - Polls
 *      description: Fetches the polls created by the requester  (authorized)
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - in: query
 *          name: search
 *          description: Search Query
 *          schema:
 *            type: string
 *
 *      responses:
 *        200:
 *          description: Fetch Successful. Returns Polls created/owned by User
 *        500:
 *          description: Server Side Error
 *        401:
 *          description: Must be logged in
 *        426:
 *          description: User is not verified yet.
 */
router.get('/', withUserId, (req, res) => {
	// TODO : get query params for search
	// TODO : req.query.search; req.query.foo;
	// TODO : req.query.search;		// String
	// TODO : req.query;		// True/False
	// TODO : req.query.public;		// True/False
	// TODO : req.query.guests;		// True/False
	// TODO : req.query.hidden;		// True/False
	// TODO : req.query.passcode;	// True/False
	// if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to get user polls'));

	// Have a proper search query:
	// TODO : ORDERBY - oldest first
	// TODO : ORDERBY - number of options
	// TODO : ORDERBY - number of tags
	// TODO : has passcode?
	// TODO : is Guest Only?
	// TODO : is Public Poll?
	// TODO : is Hidden results?
	// TODO : Matches tags?
	// TODO : Matches search query (title/description/options?)?

	let searchQuery;
	if (req.query && req.query.search && typeof req.query.search === 'string') {
		searchQuery = [
			{ title: { $regex: req.query.search, $options: 'i' } },
			{ description: { $regex: req.query.search, $options: 'i' } },
			{ tags: { $regex: req.query.search, $options: 'i' } },
			{ "options.title": { $regex: req.query.search, $options: 'i' } },
		]
	}

	if (req.user && req.user.id) {
		const query = searchQuery ? { _creator: req.user.id, $or: [...searchQuery] } : { _creator: req.user.id };
		Poll.find(query, null, { sort: { createDate: -1 } }, function (err, polls) {
			if (err) return res.status(500).send({ err, message: err.message });
			return res.status(200).send(polls);
		})
	}
	else {
		const query = searchQuery ? { _visitorId: req.visitorId ? req.visitorId : req.fingerprint.hash, $or: [...searchQuery] } : { _visitorId: req.visitorId ? req.visitorId : req.fingerprint.hash };
		Poll.find(query, null,
			{ sort: { createDate: -1 } }, function (err, polls) {
				if (err) return res.status(500).send({ err, message: err.message });
				return res.status(200).send(polls);
			})
	}
});

/**
 * @swagger
 *  /api/polls/guest:
 *    get:
 *      tags:
 *        - Polls
 *      description: Fetches the polls created by the requester  (guest/visitor)
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 * 
 *      responses:
 *        200:
 *          description: Fetch Successful. Returns Polls created/owned by guest
 *        500:
 *          description: Server Side Error
 *        404:
 *          description: Poll does not exist
 */
router.get('/guest', withUserId, (req, res) => {
	// TODO : get query params for search
	// TODO : req.query.search; req.query.foo;
	// TODO : req.query.search;		// String
	// TODO : req.query.public;		// True/False
	// TODO : req.query.guests;		// True/False
	// TODO : req.query.hidden;		// True/False
	// TODO : req.query.passcode;	// True/False
	console.log('[GET /polls/guest] req.fingerprint.hash', req.fingerprint.hash)
	console.log('[GET /polls/guest] req.visitorId', req.visitorId)
	Poll.find({ _visitorId: req.visitorId ? req.visitorId : req.fingerprint.hash }, null,
		{ sort: { createDate: -1 } }, function (err, polls) {
			if (err) return res.status(500).send({ err, message: err.message });
			return res.status(200).send(polls);
		})
});

module.exports = router;
