import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import routes from './api/routes';

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// when a random route is inputed
app.get('/health-check', (req, res) =>
	res.status(200).send({
		message: 'API is running',
	})
);

app.use('/api', routes);

// to handle 404 errors
app.use((_req, res) => res.status(404).send({ error: 'Page not found' }));

export default app;
