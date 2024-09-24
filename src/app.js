import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import routes from './api/routes';
import authorize from './middleware/authorize';
import xmlparser from 'express-xml-bodyparser';
import errorHandler from './middleware/errorHandler'; // Centralized error handler
import healthRoutes from './api/routes/health.routes'; // Separate health-check route

const app = express();

// Use morgan only in development
if (process.env.ENABLE_LOGGING === 'true') {
    app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlparser({
    trim: true,
    explicitArray: false, // Ensures elements are not wrapped in arrays
}));

// Check if request is authorized
app.use(authorize);

// Health-check route
// Health-check route for monitoring and load balancing
app.use('/health-check', healthRoutes);

// API routes
app.use('/api', routes);

// Handle 404 errors
app.use((_req, res) => res.status(404).send({ error: 'Page not found' }));

// Centralized error handling middleware
// Centralized error handling middleware (should be last in the middleware stack)
app.use(errorHandler);

export default app;
