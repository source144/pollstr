const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const { errorObject } = require('./shared/util');

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');

// ********************** //
// *** Swaggerhub Def *** //
// ********************** //

/**
 * @swagger
 * securityDefinitions:
 *   BearerAuth:
 *     type: apiKey
 *     in: header
 *     name: Authorization
 * 
 * definitions:
 * 
 *   Credentials:
 *     properties:
 *       email:
 *         type: string
 *         required: true
 *       password:
 *         type: string
 *         required: true
 * 
 *   User:
 *     properties:
 *       email:
 *         type: string
 *         required: true
 *       password:
 *         type: string
 *         required: true
 *       firstName:
 *         type: string
 *         required: false
 *       lastName:
 *         type: string
 *         required: false
 * 
 *   Verification:
 *     properties:
 *       id:
 *         type: string
 *         required: true
 *       token:
 *         type: string
 *         required: true
 * 
 *   UserInfo:
 *     properties:
 *       firstName:
 *         type: string
 *         required: false
 *       lastName:
 *         type: string
 *         required: false
 * 
 *   Email:
 *     properties:
 *       email:
 *         type: string
 *         required: true
 * 
 *   Password:
 *     properties:
 *       password:
 *         type: string
 *         required: true
 *      
 *   PasswordReset:
 *     properties:
 *       password:
 *         type: string
 *         required: true
 *       id:
 *         type: string
 *         required: true
 *       token:
 *         type: string
 *         required: true
 * 
 *   Passwords:
 *     properties:
 *       oldPassword:
 *         type: string
 *         required: true
 *       password:
 *         type: string
 *         required: true
 * 
 *   Refresh_Token:
 *     properties:
 *       refresh_token:
 *         type: string
 *         required: true
 */


// Environment config
dotenv.config();

// Routes
const authRoutes = require('./routes/auth');
const pollRoutes = require('./routes/poll');

// Constants
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "SECRET_ACCESS_KEY"
const MONGO = process.env.MONGO_URI

// Create Server
const app = express();
const server = http.createServer(app);
const io = socketio(server);
app.io = io;

const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: 'Pollstr API',
			description: 'Pollstr API Information',
			version: "1.0.0",
			contact: {
				name: "Gonen Matias"
			},
			servers: ["https://www.pollstr.app", "http://localhost:5000"]
		},
		components: {
			securitySchemes: {
				BearerAuth: {
					type: 'http',
					scheme: 'bearer',
					bearerFormat: 'JWT'
				}
			}
		}
	},
	apis: ["index.js", "routes/*.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

if (NODE_ENV === 'production')
	app.set('port', PORT);

mongoose.set('useCreateIndex', true)
mongoose.connect(MONGO, { useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true })
	.then(() => console.log('Connected to MongoDB server'))
	.catch(err => console.error('Something went wrong', err));


// TODO : live updates to polls
io.on('connection', (socket) => {
	console.log("We have a new connection!!");


	socket.on('disconnet', () => {
		console.log("User has left!!");
	});
});

// Must be authenticated
const authenticateJWT = (req, res, next) => {
	// Gather the jwt access token from the request header
	const authHeader = req.headers['authorization']
	const token = authHeader && authHeader.split(' ')[1]
	if (token == null) return res.sendStatus(401) // if there isn't any token

	jwt.verify(token, ACCESS_TOKEN, (err, user) => {
		console.log(err);
		if (err) return res.sendStatus(403);
		req.user = user;
		next(); // pass the execution off to whatever request the client intended
	})
}

// Just fill in the credentials of
// the user, if he has any..
const withCredentials = (req, res, next) => {
	const auth_header = req.headers.authorization;
	// const auth_header	= req.headers['x-access-token'] || req.headers.authorization;
	const token = auth_header && auth_header.split(' ')[1];

	if (token) {
		jwt.verify(token, ACCESS_TOKEN, (e, u) => { req.user = !e ? u : null; });
	}

	next();
}

// User must have valid credentials
// i.e. logged in
const enforceCredentials = (req, res, next) => {
	const auth_header = req.headers.authorization;
	const token = auth_header && auth_header.split(' ')[1];

	if (!token) return res.status(401).send(errorObject("Missing access token"));

	jwt.verify(token, ACCESS_TOKEN, (e, u) => {
		if (e) return res.status(403).send(e);
		req.user = u;
		next();
	});
}

// User's role must be administrator.
// Stack after withCredentials
const adminOnly = (req, res, next) => {
	if (!req.user || req.user.role !== 'admin')
		return res.sendStatus(403);

	next();
}

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/poll', withCredentials, pollRoutes);

// TODO : handle all errors here?
app.use('/api', function (req, res, next) {
	return res.status(404)
		.send({
			error: 'Endpoint not found',
			url: req.url
		});
});

if (process.env.NODE_ENV === 'production') {
	app.use(express.static('client/build'))

	app.get('*', function (req, res) {
		res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
	});
}

// Host Server
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});