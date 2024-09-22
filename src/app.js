import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import routes from './api/routes';
import authorize from './middleware/authorize';
import xmlparser from 'express-xml-bodyparser';
import parseBody from './middleware/parseBody';
import { toJson } from 'xml2json';
import errorHandler from './middleware/errorHandler'; // Centralized error handler
import healthRoutes from './routes/health'; // Separate health-check route

const app = express();

// Use morgan only in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(parseBody);
app.use(xmlparser());

// Check if request is authorized
app.use(authorize);

// Health-check route
app.use('/health-check', healthRoutes);

// API routes
app.use('/api', routes);

// Handle 404 errors
app.use((_req, res) => res.status(404).send({ error: 'Page not found' }));

// Centralized error handling middleware
app.use(errorHandler);

export default app;
