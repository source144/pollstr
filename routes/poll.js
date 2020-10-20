const express = require('express');
const router = express.Router();

// ************* //
// *** Polls *** //
// ************* //
// TODO : create a poll (user or anonymous)
router.post('/', (req, res) => { });

// TODO : delete a poll (administartor/creator) or error if poll does not exist
router.delete('/:id', (req, res) => { });

// TODO : Get poll data or error if poll does not exist
router.get('/:id', (req, res) => { });

// TODO : submit voting for a poll
// TODO : error if poll does not exist
// TODO : error if already voted
// TODO : error if not permitted to vote
router.post('/:id/vote', (req, res) => { res.status(200).json({ id: req.params.id, action: 'vote' }) });


module.exports = router;
