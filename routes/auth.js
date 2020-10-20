const { User, validate, validatePassword } = require('../models/User');
const Verification = require('../models/Verification');
const { errorObject } = require('../shared/util');
const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const router = express.Router();
const { refreshTokens } = require('../shared/jwt');
const { notify } = require('../router');

const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "SECRET_ACCESS_KEY";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN || "SECRET_REFRESH_KEY";
const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE || '30m';
const NO_REPLY_EMAIL = process.env.NO_REPLY_EMAIL || 'pollstr.app.io@gmail.com';
const DOMAIN = process.env.DOMAIN || 'pollstr.app';
const NODE_ENV = process.env.NODE_ENV || 'dev'

// ********************** //
// *** Authentication *** //
// ********************** //
const enforceCredentials = (req, res, next) => {
	const auth_header = req.headers.authorization;
	const token = auth_header && auth_header.split(' ')[1];

	if (!token) return res.status(401).send(errorObject("Missing access token"));

	jwt.verify(token, ACCESS_TOKEN, (e, u) => {
		if (e) return res.status(403).send(e);
		req.user = u;
		next();
	});
}

// TODO : Login - return token or error
router.post('/login', (req, res) => {

	const { error } = validate(req.body);
	if (error) return res.status(400).send(errorObject(error.details[0].message));


	User.findOneAndUpdate({ email: req.body.email }, { lastLogin: Date.now() }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('Email or password incorrect'));
		if (!user.verified) return res.status(426).send(errorObject('Verification needed'));

		// test a matching password
		user.comparePassword(req.body.password, function (err, isMatch) {
			if (err || !isMatch)
				return res.status(401).send(errorObject('Email or password incorrect'));

			const accessToken = jwt.sign({ email: user.email, role: user.role }, ACCESS_TOKEN, { expiresIn: ACCESS_TOKEN_LIFE });
			const refreshToken = jwt.sign({ email: user.email, role: user.role }, REFRESH_TOKEN);
			refreshTokens.push(refreshToken);

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

router.post('/refresh', (req, res) => {
	// const auth_header	= req.headers.authorization;
	// const token 		= auth_header && auth_header.split(' ')[1];
	const token = req.body.refresh_token;

	if (!token) return res.status(401).send(errorObject("Missing refresh token"));
	// jwt.verify(token, ACCESS_TOKEN, (err, user) => { if (err) return res.status(403).send(err);	});

	if (!refreshTokens.includes(token)) return res.status(403).send(errorObject("Invalid refresh token"));

	jwt.verify(token, REFRESH_TOKEN, (err, user) => {
		if (err) return res.status(403).send(err);

		const accessToken = jwt.sign({ email: user.email, role: user.role }, ACCESS_TOKEN, { expiresIn: ACCESS_TOKEN_LIFE });

		return res.status(200).send({ accessToken });
	});

});

router.post('/logout', (req, res) => {
	const token = req.body.refresh_token;
	refreshTokens = refreshTokens.filter(t => t !== token);

	res.status(200);
});

// TODO : Signup - return created or error
router.post('/signup', (req, res) => {
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
				text: `${['Hello', FULL_NAME].join(' ').trim()}, welcome to Pollstr!\n\nTo complete your registration, please verify your email with the following link:\nhttp://${DOMAIN}/verify?id=${verification._id}&token=${verification.token}\n\nOn behalf of the Pollstr team, thank you for joining us.\nPollstr | Voting Intuitively`
			};
			transporter.sendMail(mailOptions, function (err) {
				if (err) { abort(); return res.status(500).send(err); }
				if (NODE_ENV === 'prod') return res.status(201).send(verification);
				else if (NODE_ENV === 'dev') return res.status(201).send(verification);
				else return res.status(201).send(user);
			});
		});
	});
});

// TODO : get user data provided a token or error
router.get('/', enforceCredentials, (req, res) => {
	User.findOne({ email: req.user.email }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('User not found'));

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

// TODO : update user data provided a token or error
router.put('/', (req, res) => {

});

// TODO : update user password provided a token or error
router.put('/password', enforceCredentials, (req, res) => {
	const { error } = validate(req.body, password=false);
	if (error) return res.status(400).send(errorObject(error.details[0].message));
	if (!req.body.oldPassword) return res.status(400).send(errorObject('Missing old password'));
	if (req.body.password === req.body.oldPassword) return res.status(200).send(errorObject('Nothing to update'));

	User.findOne({ email: req.user.email }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(401).send(errorObject('User not found'));
		if (!user.verified) return res.status(426).send(errorObject('Verification needed'));

		// test a matching password
		user.comparePassword(req.body.oldPassword, function (err, isMatch) {
			if (err || !isMatch)
				return res.status(401).send(errorObject('Password is incorrect'));

			user.password = req.body.password;
			user.save(function (err) {
				if (err) return res.status(500).send(errorObject(err.message));
				return res.status(204);
			});
		});
	});
});


// TODO : verify user by email
router.post('/verify', (req, res) => {
	if (!req.body.token) return res.status(400).send(errorObject('Missing verification token'));
	if (!req.body.id) return res.status(400).send(errorObject('Missing verification id'));


	Verification.findOne({ token: req.body.token, _id: req.body.id }, function (err, verification) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!verification) return res.status(400).send(errorObject('Verification either expired or is invalid'));

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

// TODO : verify user by email
router.post('/verify/resend', (req, res) => {
	const { error } = validate(req.body, password=false);
	if (error) return res.status(400).send(errorObject(error.details[0].message));

	User.findOne({ email: req.body.email, verified: false }, function (err, user) {
		if (err) return res.status(500).send(errorObject(err.message));
		if (!user) return res.status(400).send(errorObject('User already verified or does not exist'));

		// Get rid of old verifications (shouldn't be more than one)
		Verification.deleteMany({ _userId: user._id }, function (err) {
			if (err) console.log("DELETE VERIFICATION", err);
		});

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
				text: `${['Hello', FULL_NAME].join(' ').trim()}, welcome to Pollstr!\n\nTo complete your registration, please verify your email with the following link:\nhttp://${DOMAIN}/verify?id=${verification._id}&token=${verification.token}\n\nOn behalf of the Pollstr team, thank you for joining us.\nPollstr | Voting Intuitively`
			};
			transporter.sendMail(mailOptions, function (err) {
				if (err) return res.status(500).send(err);
				if (NODE_ENV === 'prod') return res.status(201).send(verification);
				else if (NODE_ENV === 'dev') return res.status(201).send(verification);
				else return res.status(201).send(user);
			});
		});
	});
});

// TODO : send reset link to user email
router.post('/forgot', (req, res) => {
	// TODO : check if user exists
	// TODO : Create token for reset
	// TODO : store token in DB - relate to user _id
	// TODO : send reset email
	// TODO : link to front-end page to handle verification
	// TODO : Front end sends request to verify
	// TODO : http://pollstr.app/reset?id=TOKEN_GOES_HERE

	// TODO : Handle any errors
	// TODO : User not found
});

// TODO : reset password provided a reset link/token
router.put('/reset', (req, res) => {
	// TODO : Get TOKEN from query (&id=TOKEN_GOES_HERE)
	// TODO : Find token in DB
	// TODO : Find user associated with token
	// TODO : Try to perform update for user password
	// TODO : remove TOKEN from DB
	// TODO : send success.

	// TODO : Handle any errors
	// TODO : Token invalid
	// TODO : User not found
	// TODO : Password not valid?
});

module.exports = router;