export default (req, res, next) => {
	if (req.headers.token === process.env.ACCESS_TOKEN && req.headers.client === process.env.CLIENT) {
		// user is authorized
		next();
	} else {
		// return unauthorized
		res.status(401).json({ error: 'You are not Authorized' });
	}
};
