export default (req, res, next) => {
    const { token, client } = req.headers;

    // Normalize and validate headers
    if (!token || !client) {
        return res.status(400).json({ error: 'Missing authorization headers' });
    }

    if (token.trim() === process.env.ACCESS_TOKEN && client.trim() === process.env.CLIENT) {
        // User is authorized
        next();
    } else {
        // Return unauthorized with specific message
        res.status(401).json({ error: 'Invalid token or client' });
    }
};
