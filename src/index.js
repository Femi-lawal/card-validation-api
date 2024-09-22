import app from './app';

const PORT = process.env.PORT || 5000;

// Validate environment variables
if (!process.env.NODE_ENV) {
    throw new Error('NODE_ENV is not defined. Please set the environment variable.');
}

const server = app.listen(PORT, () => {
    console.info(`Express server started on port ${PORT}.`);
});

// Graceful shutdown
const shutdown = (signal) => {
    console.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.info('Closed out remaining connections.');
        process.exit(0);
    });
};

// Handle termination signals
['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => shutdown(signal));
});

export default app;
