import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import morgan from 'morgan';
import routes from './api/routes';
import authorize from './middleware/authorize';
import xmlparser from 'express-xml-bodyparser';
import { toJson } from 'xml2json';

const app = express();

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Check if request is authorized
app.use(authorize);

// Body parser, reading data from body into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xmlparser());

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
