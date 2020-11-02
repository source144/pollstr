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
 * 
 *      responses:
 *        200:
 *          description: Fetch Successful. Returns Polls created/owned by User
 *        500:
 *          description: Server Side Error
 *        401:
 *          description: Must be logged in
 *        404:
 *          description: Poll does not exist
 *        426:
 *          description: User is not verified yet.
 */
router.get('/', withUserId, (req, res) => {
	if (!req.user || !req.user.id) return res.status(401).send(errorObject('Must be logged in to get user polls'));

	Poll.find({ _creator: req.user.id }, function (err, polls) {
		if (err) return res.status(500).send({ err, message: err.message });
		return res.status(200).send(polls);
	})
});

module.exports = router;
