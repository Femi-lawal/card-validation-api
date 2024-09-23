export const healthCheck = (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'API is healthy and running.',
        timestamp: new Date().toISOString(),
    });
};