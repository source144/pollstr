const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	res.send('Server is up and running');
});

// ********************** //
// *** Authentication *** //
// ********************** //
// TODO : Login - return token or error
router.post('/auth/login', (req, res) => {
	
});

// TODO : Signup - return created or error
router.post('/auth/signup', (req, res) => {
	
});

// TODO : get user data provided a token or error
router.get('/auth', (req, res) => {
	
});

// TODO : update user data provided a token or error
router.put('/auth', (req, res) => {
	
});

// TODO : verify user by email
router.post('/auth/verify', (req, res) => {
	
});

// TODO : send reset link to user email
router.post('/auth/forgot', (req, res) => {
	
});

// TODO : send reset link to user email
router.post('/auth/reset', (req, res) => {
	
});

// TODO : reset password provided a reset link/token
router.put('/auth/reset', (req, res) => {
	
});

// ************* //
// *** Polls *** //
// ************* //
// TODO : create a poll (user or anonymous)
router.post('/poll', (req, res) => {
	
});

// TODO : delete a poll (administartor/creator)
router.delete('/poll', (req, res) => {
	
});

module.exports = router;