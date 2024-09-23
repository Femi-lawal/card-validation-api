const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log error stack for debugging

    // Send a response to the client
    res.status(500).json({
        success: false,
        message: 'An unexpected error occurred. Please try again later.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined, // Show error details only in development
    });
};

export default errorHandler;
