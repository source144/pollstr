const { User, validate, validatePassword } = require('../models/User');
const { Verification, PasswordReset } = require('../models/Verification');
const { Fingerprint } = require('../models/Fingerprint');
const { errorObject } = require('../shared/util');
const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const _ = require('lodash');
const router = express.Router();
const { refreshTokens, getSeconds } = require('../shared/jwt');
const { notify } = require('../router');
const mongoObjectId = require('mongoose').Types.ObjectId;

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "SECRET_ACCESS_KEY";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || "SECRET_REFRESH_KEY";
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE || '30m';
const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE || '5d';
const NO_REPLY_EMAIL = process.env.NO_REPLY_EMAIL || 'pollstr.app.io@gmail.com';
const DOMAIN = process.env.DOMAIN || 'pollstr.app';
const NODE_ENV = process.env.NODE_ENV || 'development'

const lowerRegex = /(?=.*[a-z])/
const upperRegex = /(?=.*[A-Z])/
const numbrRegex = /(?=.*[0-9])/

_.mixin({
	compactObject: function (o) {
		var clone = _.clone(o);
		_.each(clone, function (v, k) {
			if (!v) {
				delete clone[k];
			}
		});
		return clone;
	}
});

// ********************** //
// *** Authentication *** //
// ********************** //
const enforceCredentials = (req, res, next) => {
	const auth_header = req.headers.authorization;
	const token = auth_header && auth_header.split(' ')[1];

	if (!token) return res.status(401).send(errorObject("Missing access token"));

	jwt.verify(token, ACCESS_TOKEN, (e, u) => {
		if (e) {
			if (err instanceof jwt.TokenExpiredError) return res.status(401).send({ message: "Access token has expired", action: 'REFRESH' });
			else return res.status(401).send({ message: err.message, action: 'LOGOUT' });
		}
		req.user = u;
		next();
	});
}

// TODO : SwaggerHub documentation?
router.post('/fingerprint', (req, res) => {
	if (!req.body.visitorId)
		return res.status(400).send(errorObject('Missing Visitor Id'));

	Fingerprint.findOne({ fingerprint: req.body.visitorId }, function (error, fingerprint) {

		if (error) return res.status(500).send(errorObject(error.message));
		if (fingerprint) return res.status(200).send({});


		const _fingerprint = new Fingerprint({
			fingerprint: req.body.visitorId
		});

		_fingerprint.save(function (error) {
			console.log('[POST auth/fingerprint] save() error ', error)
			if (error) return res.status(500).send(errorObject(error.message));
			else return res.status(201).send({});
		});
	})
})


/**
 * @swagger
 *  /api/auth/login:
 *    post:
 *      tags:
 *        - Auth
 *      description: Authenticates users credentials and generates an access token
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: credentials
 *          description: Login Credentials
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Credentials'
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
router.post('/login', (req, res) => {

	const { error } = validate(req.body);
	if (error) return res.status(400).send(errorObject(error.details[0].message));


	User.findOneAndUpdate({ email: req.body.email }, { lastLogin: Date.now() }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('Email or password incorrect'));
		if (!user.verified) return res.status(426).send(errorObject('Email verification needed'));

		// test a matching password
		user.comparePassword(req.body.password, function (err, isMatch) {
			if (err || !isMatch)
				return res.status(401).send(errorObject('Email or password incorrect'));

			const accessToken = jwt.sign({ email: user.email, role: user.role }, ACCESS_TOKEN, { expiresIn: ACCESS_TOKEN_LIFE });
			const refreshToken = jwt.sign({ email: user.email, role: user.role }, REFRESH_TOKEN, { expiresIn: REFRESH_TOKEN_LIFE });
			refreshTokens.push({ token: refreshToken, hash: req.fingerprint.hash });

			const resBody = {
				email: user.email,
				firstName: user.firstName,
				lastName: user.lastName,
				role: user.role,
				lastLogin: user.lastLogin,
				accessToken,
				refreshToken
			}

			return res.status(200).send(resBody);
		});
	});
});

/**
 * @swagger
 *  /api/auth/refresh:
 *    post:
 *      tags:
 *        - Auth
 *      description: Authenticates users credentials and generates an access token
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: Token
 *          description: Refresh Token
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Refresh_Token'
 *      responses:
 *        401:
 *          description: Missing or invalid refresh token
 *        403:
 *          description: Expired refresh token
 *        200:
 *          description: Success. New access token generated
 */
router.post('/refresh', (req, res) => {
	// const auth_header	= req.headers.authorization;
	// const token 		= auth_header && auth_header.split(' ')[1];
	// const token = req.signedCookies['refresh'];
	const token = req.body.refresh_token;

	if (!token) return res.status(401).send({ message: 'Missing refresh token', action: 'LOGOUT' });

	// jwt.verify(token, ACCESS_TOKEN, (err, user) => { if (err) return res.status(403).send(err);	});

	// if (!refreshTokens.includes(token)) return res.status(403).send(errorObject("Invalid refresh token"));
	if (!_.find(refreshTokens, { token, hash: req.fingerprint.hash })) return res.status(403).send(errorObject("Invalid refresh token"));

	jwt.verify(token, REFRESH_TOKEN, (err, user) => {
		if (err) {
			_.remove(refreshTokens, { token });
			if (err instanceof jwt.TokenExpiredError) return res.status(403).send({ message: "Refresh token has expired", action: 'LOGOUT' });
			else return res.status(401).send({ message: e.message, action: 'LOGOUT' });
		}

		const accessToken = jwt.sign({ email: user.email, role: user.role }, ACCESS_TOKEN, { expiresIn: ACCESS_TOKEN_LIFE });

		return res.status(200).send({ accessToken });
	});

});

/**
 * @swagger
 *  /api/auth/logout:
 *    post:
 *      tags:
 *        - Auth
 *      description: Disposes the user's refresh token
 *      parameters:
 *        - name: Token
 *          description: Refresh Token
 *          in: body
 *          required: false
 *          schema:
 *            $ref: '#/definitions/Refresh_Token'
 *      responses:
 *        204:
 *          description: Success.
 */
router.post('/logout', (req, res) => {
	const token = req.body.refresh_token;
	_.remove(refreshTokens, { token });
	// refreshTokens = refreshTokens.filter(t => t !== token);

	res.status(204).send();
});

/**
 * @swagger
 *  /api/auth/signup:
 *    post:
 *      tags:
 *        - Auth
 *      description: Creates a new user and sends out a verification email
 *      parameters:
 *        - name: User
 *          description: User's registration info
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/User'
 *      produces:
 *        - application/json
 *      responses:
 *        401:
 *          description: Missing refresh token
 *        403:
 *          description: Invalid refresh token
 *        200:
 *          description: Success. New action token generated
 */
router.post('/signup', (req, res) => {
	req.body = _.compactObject(_.pick(req.body, ['email', 'password', 'firstName', 'lastName']));
	const { error } = validate(req.body);
	if (error) return res.status(400).send(errorObject(error.details[0].message));

	if (req.body.firstName) req.body.firstName = req.body.firstName.toLowerCase().capitalize();
	if (req.body.lastName) req.body.lastName = req.body.lastName.toLowerCase().capitalize();

	user = new User({
		email: req.body.email,
		password: req.body.password,
		firstName: req.body.firstName,
		lastName: req.body.lastName
	});

	user.save(function (err) {
		if (err) {
			if (err.errors) return res.status(422).send(errorObject(err.message.split(':')[2]));
			else return res.status(422).send(err);
		}
		const abort = () => user.remove(function (err, removed) {
			if (err) {
				console.log('abort failed')
				return res.status(500).send(err);
			}
		});

		// TODO : Create token for verification
		// TODO : store token in DB - relate to user _id
		// TODO : send verification email
		// TODO : link to front-end page to handle verification
		// TODO : Front end sends request to verify
		// TODO : http://pollstr.app/verify?id=TOKEN_GOES_HERE
		const verification = new Verification({ _userId: user._id, token: crypto.randomBytes(12).toString('hex') })
		verification.save(function (err) {
			if (err) { abort(); return res.status(500).send(err); }
			const FULL_NAME = user.fullName();

			// Send the email
			var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
			var mailOptions = {
				from: NO_REPLY_EMAIL,
				to: user.email,
				subject: 'Confirm your Pollstr account',
				text: `${['Hello', FULL_NAME].join(' ').trim()}, Welcome to Pollstr!\n\nTo complete your registration, please verify your email with the following link:\nhttps://${DOMAIN}/verify/${verification._id}-${verification.token}\n\nOn behalf of the Pollstr team, thank you for joining us.\nPollstr | Voting Intuitively`
			};
			transporter.sendMail(mailOptions, function (err) {
				if (err) { abort(); return res.status(500).send(err); }
				if (NODE_ENV === 'production') return res.status(201).send(verification);
				else if (NODE_ENV === 'development') return res.status(201).send(verification);
				else return res.status(201).send(user);
			});
		});
	});
});

/**
 * @swagger
 *  /api/auth/:
 *    get:
 *      tags:
 *        - Auth
 *      description: Retrieves User Information
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      responses:
 *        401:
 *          description: User not found or Missing access token
 *        403:
 *          description: Invalid access token
 *        200:
 *          description: Success. (information sent)
 *    put:
 *      tags:
 *        - Auth
 *      description: Updates user information
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: User Info
 *          description: User's information
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/UserInfo'
 *      responses:
 *        500:
 *          description: Server Error
 *        401:
 *          description: User not found or Missing access token
 *        403:
 *          description: Invalid access token
 *        426:
 *          description: User is not verified yet.
 *        200:
 *          description: Nothing to update
 *        204:
 *          description: Updated user information
 */
router.get('/', enforceCredentials, (req, res) => {
	User.findOne({ email: req.user.email }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('User not found'));
		if (!user.verified) return res.status(426).send(errorObject('Email verification needed'));

		const resBody = {
			email: user.email,
			firstName: user.firstName,
			lastName: user.lastName,
			role: user.role,
			lastLogin: user.lastLogin
		}

		return res.status(200).send(resBody);
	});
});
router.put('/', enforceCredentials, (req, res) => {
	const { error } = validatePassword({ ...req.body, email: req.user.email }, password = false);
	if (error) return res.status(400).send(errorObject(error.details[0].message));

	User.findOne({ email: req.user.email }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('User not found'));

		// Readability
		const newFN = req.body.firstName;
		const newLN = req.body.lastName;
		const oldFN = user.firstName;
		const oldLN = user.lastName;

		// Check if nothing was updated
		// (AS READABLE AS IT GETS??)
		if (((oldFN == null && newFN == null)
			|| (newFN != null && newFN.toLowerCase().capitalize() == oldFN))
			&& ((oldLN == null && newLN == null)
				|| (newLN != null && newLN.toLowerCase().capitalize() == oldLN)))
			return res.status(200).send(errorObject('Nothing to update'));

		// Update first name (or remove field)
		if (newFN) user.firstName = newFN
		else user.firstName = undefined;

		// Update last name (or remove field)
		if (newLN) user.lastName = newLN
		else user.lastName = undefined;

		user.save(function (err) {
			if (err) return res.status(500).send(errorObject(err.message));
			return res.status(204).send();
		});
	});
});

/**
 * @swagger
 *  /api/auth/password:
 *    put:
 *      tags:
 *        - Auth
 *      description: Update user password
 *      security:
 *        - BearerAuth: []
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: Passwords
 *          description: User's old and new passwords
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Passwords'
 *      responses:
 *        500:
 *          description: Server Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: User not found or Missing access token
 *        403:
 *          description: Invalid access token
 *        426:
 *          description: User is not verified yet.
 *        200:
 *          description: Nothing to update
 *        204:
 *          description: Password Updated
 */
router.put('/password', enforceCredentials, (req, res) => {
	const { error } = validatePassword(req.body);
	if (error) return res.status(400).send(errorObject(error.details[0].message));
	if (!req.body.oldPassword) return res.status(400).send(errorObject('Missing old password'));
	if (req.body.password === req.body.oldPassword) return res.status(200).send(errorObject('Nothing to update'));

	User.findOne({ email: req.user.email }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('User not found'));
		if (!user.verified) return res.status(426).send(errorObject('Email verification needed'));

		// test a matching password
		user.comparePassword(req.body.oldPassword, function (err, isMatch) {
			if (err || !isMatch)
				return res.status(401).send(errorObject('Password is incorrect'));

			// Update password
			user.password = req.body.password;

			// Comit changes
			user.save(function (err) {
				if (err) return res.status(500).send(errorObject(err.message));
				return res.status(204).send();
			});
		});
	});
});

/**
 * @swagger
 *  /api/auth/verify/resend:
 *    post:
 *      tags:
 *        - Auth
 *      description: Resend Verification Email
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: Email
 *          description: User Email
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Email'
 *      responses:
 *        500:
 *          description: Server Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: User already verified or does not exist
 *        201:
 *          description: New verification email sent
 */
router.post('/verify/resend', (req, res) => {
	delete req.body.firstName; delete req.body.lastName;
	const { error } = validate(req.body, password = false);
	if (error) return res.status(400).send(errorObject(error.details[0].message));

	User.findOne({ email: req.body.email, verified: false }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('User already verified or does not exist'));

		// Get rid of old verifications (shouldn't be more than one)
		Verification.deleteMany({ _userId: user._id }, function (err) {
			if (err) return res.status(500).send(err);

			// Create and send new verification
			const verification = new Verification({ _userId: user._id, token: crypto.randomBytes(12).toString('hex') })
			verification.save(function (err) {
				if (err) return res.status(500).send(err);
				const FULL_NAME = user.fullName();

				// Send the email
				var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
				var mailOptions = {
					from: NO_REPLY_EMAIL,
					to: user.email,
					subject: 'Confirm your Pollstr account',
					text: `${['Hello', FULL_NAME].join(' ').trim()}, welcome to Pollstr!\n\nTo complete your registration, please verify your email with the following link:\nhttp://${DOMAIN}/verify/${verification._id}-${verification.token}\n\nOn behalf of the Pollstr team, thank you for joining us.\nPollstr | Voting Intuitively`
				};
				transporter.sendMail(mailOptions, function (err) {
					if (err) return res.status(500).send(err);
					if (NODE_ENV === 'production') return res.status(201).send(verification);
					else if (NODE_ENV === 'development') return res.status(201).send(verification);
					else return res.status(201).send(user);
				});
			});
		});
	});
});

/**
 * @swagger
 *  /api/auth/verify/{id}:
 *    post:
 *      tags:
 *        - Auth
 *      description: Verify User
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Verification Id
 *          in: path
 *          required: true
 *        - name: Verification
 *          description: Verification Information
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Verification'
 *      responses:
 *        500:
 *          description: Server Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Verification invalid or expired
 *        202:
 *          description: Already verified 
 *        200:
 *          description: Now verified
 */
router.post('/verify/:id', (req, res) => {
	if (!req.body.token) return res.status(400).send(errorObject('Missing verification token'));
	if (!req.params.id) return res.status(400).send(errorObject('Missing verification id'));

	if (!mongoObjectId.isValid(req.params.id)) return res.status(400).send(errorObject('Invalid verification id'));

	Verification.findOne({ token: req.body.token, _id: req.params.id }, function (err, verification) {
		if (err) return res.status(500).send({ err, message: err.message });
		if (!verification) return res.status(401).send(errorObject('Verification either expired or is invalid'));

		User.findOneAndUpdate({ _id: verification._userId, verified: false }, { verified: true }, function (err, user) {
			if (err) return res.status(500).send(errorObject(err.message));
			if (!user) return res.status(202).send(errorObject('User is already verified'));


			verification.remove(function (err, removed) {
				if (err) return res.status(500).send(err);
				return res.status(200).send({ notify: `User has been verified, you may now log in` });
			});
		});
	});
});



/**
 * @swagger
 *  /api/auth/password/forgot:
 *    post:
 *      tags:
 *        - Auth
 *      description: Forgot Password
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: Email
 *          description: User Email
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Email'
 *      responses:
 *        500:
 *          description: Server Error
 *        400:
 *          description: Request body error
 *        404:
 *          description: User does not exist
 *        426:
 *          description: User is not verified yet.
 *        201:
 *          description: Reset password email sent
 */
router.post('/password/forgot', (req, res) => {
	delete req.body.firstName; delete req.body.lastName;
	const { error } = validate(req.body, password = false);
	if (error) return res.status(400).send(errorObject(error.details[0].message));

	User.findOne({ email: req.body.email }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(404).send(errorObject('User does not exist'));
		if (!user.verified) return res.status(426).send(errorObject('Email verification needed'));

		// Get rid of old verifications (shouldn't be more than one)
		PasswordReset.deleteMany({ _userId: user._id }, function (err) {
			if (err) return res.status(500).send(err);

			// Create and send new verification
			const passwordReset = new PasswordReset({ _userId: user._id, token: crypto.randomBytes(12).toString('hex') })
			passwordReset.save(function (err) {
				if (err) return res.status(500).send(err);
				const FULL_NAME = user.fullName();

				// Send the email
				var transporter = nodemailer.createTransport({ service: 'Sendgrid', auth: { user: process.env.SENDGRID_USERNAME, pass: process.env.SENDGRID_PASSWORD } });
				var mailOptions = {
					from: NO_REPLY_EMAIL,
					to: req.body.email,
					subject: 'Reset your Pollstr account password',
					text: `${['Hello', FULL_NAME].join(' ').trim()},\n\nA reset password request has been received by the system.\n\nIf you did not submit the request, please ignore this message.\nOtherwise, use the following link to reset your password:\nhttps://${DOMAIN}/password/reset/${passwordReset._id}-${passwordReset.token}\n\nThank you, the Pollstr team.\nPollstr | Voting Intuitively`
				};
				transporter.sendMail(mailOptions, function (err) {
					if (err) return res.status(500).send(err);
					if (NODE_ENV === 'production') return res.status(201).send(passwordReset);
					else if (NODE_ENV === 'development') return res.status(201).send(passwordReset);
					else return res.status(201).send(user);
				});
			});
		});

	});
});

// TODO : reset password provided a reset link/token
/**
 * @swagger
 *  /api/auth/password/reset/{id}:
 *    put:
 *      tags:
 *        - Auth
 *      description: Password Reset
 *      produces:
 *        - application/json
 *      parameters:
 *        - name: id
 *          description: Password Reset Id
 *          in: path
 *          required: true
 *        - name: Password Reset
 *          description: New password and reset token
 *          in: body
 *          required: true
 *          schema:
 *            $ref: '#/definitions/Password_Verification'
 *      responses:
 *        500:
 *          description: Server Error
 *        400:
 *          description: Request body error
 *        401:
 *          description: Password Reset Expired or Invalid
 *        404:
 *          description: User does not exist
 *        426:
 *          description: User is not verified yet.
 *        200:
 *          description: Password Updated
 */
router.put('/password/reset/:id', (req, res) => {
	// const { error } = validatePassword(req.body);
	const pwDetails = [];
	let pwLength;
	// if (error) return res.status(400).send(errorObject(error.details[0].message));

	if (!lowerRegex.test(req.body.password)) pwDetails.push('1 lower case letter');
	if (!upperRegex.test(req.body.password)) pwDetails.push('1 upper case letter');
	if (!numbrRegex.test(req.body.password)) pwDetails.push('1 number');

	if (req.body.password.length < 8) pwLength = `be at least 8 letters${!!pwDetails.length ? ',' : ''} `;
	if (req.body.password.length > 24) pwLength = `be at most 24 letters${!!pwDetails.length ? ',' : ''} `;

	if (pwDetails.length || pwLength)
		return res.status(400).send(errorObject(`Password must ${pwLength ? pwLength : ''}contain ${pwDetails.length == 1 ? pwDetails.pop() : pwDetails.slice(0, -1).join(', ')}${pwDetails.length >= 2 ? ` and ${pwDetails.pop()}` : ''}`));

	if (!req.body.token) return res.status(400).send(errorObject('Missing password reset token'));
	if (!req.params.id) return res.status(400).send(errorObject('Missing password password reset id'));

	if (!mongoObjectId.isValid(req.params.id)) res.status(400).send(errorObject('Invalid verification id'));
	// Find the password reset request
	PasswordReset.findOne({ token: req.body.token, _id: req.params.id }, function (err, passwordReset) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!passwordReset) return res.status(401).send(errorObject('Password reset either expired or is invalid'));

		// Find the user who requested the password reset
		User.findOne({ _id: passwordReset._userId }, function (err, user) {
			if (err) return res.status(500).send(errorObject(err.message));
			if (!user) return res.status(404).send(errorObject('User does not exist'));
			if (!user.verified) return res.status(426).send(errorObject('Email verification needed'));

			// Update password to the one the user just set
			user.password = req.body.password;

			// Commit update
			user.save(function (err) {
				if (err) return res.status(500).send(err);

				// Dispose password reset request
				passwordReset.remove(function (err, removed) {
					if (err) return res.status(500).send(err);
					return res.status(200).send({ notify: `User password updated` });
				});
			});
		});
	});
});

module.exports = router;