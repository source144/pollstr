const express = require('express');
const router = express.Router();

// ************* //
// *** Polls *** //
// ************* //
// TODO : Add a poll schema
/**
 * @swagger
 *  /api/poll/:
 *    post:
 *      tags:
 *        - Auth
 *      description: Creates a new poll for a user or guest
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
router.post('/', (req, res) => {
	// TODO : find hash tags in title and in description and add them to tags as well
	const pollSchemaDemo = {
		title: "",					// String
		Description: "",			// String
		passcode: "",				// Hashed String
		exiprationDate: Date.now(),	// Date
		usersOnly: false,			// Boolean
		public: false,				// Boolean
		tags: [],					// Array of Strings
		options: [{}, {}, {}]		// Array of Options (schema)
	};

	const optionSchemaDemo = {
		title: "",
		description: ""
	};

	// TODO : withCredentials (optional authentication)
	// TODO : only users who are logged in can REQUIRE LOGIN for poll
	// TODO : Discard options that match
	// TODO : Check expiration date
	// TODO : Check if the poll has 2 options or more
	// TODO : create poll in DB
	// TODO : return Id
});

// TODO : delete a poll (administartor/creator) or error if poll does not exist
router.delete('/:id', (req, res) => { });

// TODO : Add poll + option schema
/**
 * @swagger
 *  /api/poll/{id}:
 *    get:
 *      tags:
 *        - Auth
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
router.get('/:id', (req, res) => {
	// console.log(req.params.id);
	// TODO : withCredentials (optional authentication)
	// TODO : Find poll in DB
	// TODO : Check if user is authorized to see this poll (requires authorization)
	// TODO : Check if user has voted on this poll
	// TODO :~~~: Through fingerprint hash
	// TODO :~~~: Through user id
	// TODO :
	// TODO : If user voted, return the option he/she selected

	return res.status(200).send({});
});

// TODO : submit voting for a poll
// TODO : error if poll does not exist
// TODO : error if already voted
// TODO : error if not permitted to vote
// TODO : Add a poll schema
/**
 * @swagger
 *  /api/poll/{id}/vote/{optionId}:
 *    post:
 *      tags:
 *        - Auth
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
router.post('/:id/vote/:optionId', (req, res) => {
	res.status(200).json({ id: req.params.id, action: 'vote' })
});


module.exports = router;
