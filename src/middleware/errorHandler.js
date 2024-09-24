import logger from '../utils/logger';

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack); // Logs error stack
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};

export default errorHandler;