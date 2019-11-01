var mongoose = require('mongoose');
var router = require('express').Router();
var User = mongoose.model('User');
var auth = require('../../utils/auth');

router.get('/search/username/:username', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	var tUser = await User.findOne({ username: req.params.username }).then(function(user) {
		if(!user){ return res.status(422).json({ errors: {username: 'does not exist.'} }); }

		if (user.id == myUser.id) {
			return res.status(422).json({ errors: {username: 'it\'s yourself.'} });
		}

		if (myUser.hasRelationship(user.id)) {
			return res.status(422).json({ errors: {usernamed: 'already linked' } })
		}

		return user.toProfileJSONFor();
	}).catch(next);

	res.json({ user: tUser })
})

router.post('/send-request', auth.required, async function(req, res, next) {
	var myUser = await User.findById(req.payload.id).then(function(user) {
		if(!user){ return res.sendStatus(401); }

		return user;
	}).catch(next);

	await myUser.linkToRelative(req.body.user.id, req.body.user.relationship);

	myUser = await User.findById(req.payload.id).populate('relatives.userRef').then(function(user) {
		return user;
	});

	return res.json({ user: myUser });
})

module.exports = router;
