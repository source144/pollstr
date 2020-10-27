const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const Fingerprint = require('express-fingerprint');
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
 *   PollOptions:
 *     properties:
 *       id:
 *         type: string
 *         required: true
 * 
 *   Poll:
 *     properties:
 *       title:
 *         type: string
 *         required: true
 *       description:
 *         type: string
 *       timeToLive:
 *         type: integer
 *       passcode:
 *         type: string
 *       usersOnly:
 *         type: boolean
 *       public:
 *         type: boolean
 *       tags:
 *         type: string
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
 *   Passcode:
 *     properties:
 *       passcode:
 *         type: string
 *         required: false
 * 
 *   Password:
 *     properties:
 *       password:
 *         type: string
 *         required: false
 * 
 *   Password_Verification:
 *     properties:
 *       password:
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
app.use(cors());
app.options('*', cors());
// app.use(cors())
const server = http.createServer(app);
const io = socketio(server, { origins: '*:*' });
// io.set('origins', `https://${process.env.DOMAIN}:*`);
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
		jwt.verify(token, ACCESS_TOKEN, (e, u) => {
			if (e) {
				if (e instanceof jwt.TokenExpiredError) return res.status(401).send({ message: "Access token has expired", action: 'REFRESH' });
				else return res.status(401).send({ message: e.message, action: 'LOGOUT' });
			}
			req.user = !e ? u : null;
			next();
		});
	}
	else next();
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
12321
// User's role must be administrator.
// Stack after withCredentials
const adminOnly = (req, res, next) => {
	if (!req.user || req.user.role !== 'admin')
		return res.sendStatus(403);

	next();
}



// TODO : live updates to polls
const withSocket = (req, res, next) => { res.io = io; next(); }
io.on('connection', (socket) => {
	console.log(`[SocketIO] New connection`);
	socket.on('join', room => {
		// if (socket.rooms.indexOf(room) >= 0) {
		socket.join(room);
		socket.emit('success', `You have successfully joined '${room}'!`);
		console.log(`[SocketIO] User has joined ${room}`);
		// } else console.log(`[SocketIO] User attempted to join '${room}`);
	});

	socket.on('leave', room => {
		// if (socket.rooms.indexOf(room) >= 0) {
		socket.leave(room);
		socket.emit('success', `You have successfully left '${room}'`);
		console.log(`[SocketIO] User has left ${room}`);
		// } else console.log(`[SocketIO] User attempted to leave '${room}`);
	})

	socket.on('disconnet', () => {
		console.log(`[SocketIO] User disconnected`);
	});
});
function emitPollData(pollId, eventName, payload) {
	io.in(pollId).emit(eventName, payload);
};



app.use(morgan("dev"));
app.use(bodyParser.json());

// CORS
// app.use((req, res, next) => {
// 	console.log('**** Reached CORS ****')
// 	console.log(req.headers.origin);
// 	console.log(req.get('origin'));
// 	console.log(req.method);
// 	const allowedOrigins = ['http://localhost:3000', "https://pollstr.app", "http://pollstr.app", "https://pollstr-app.herokuapp.com/", "https://pollstr-app.herokuapp.com/"];
// 	const origin = req.headers.origin;
// 	if (allowedOrigins.includes(origin)) {
// 		res.setHeader('Access-Control-Allow-Origin', origin);
// 	} else res.setHeader('Access-Control-Allow-Origin', '*');
// 	res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
// 	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Bearer');
// 	res.header('Access-Control-Allow-Credentials', true);

// 	next();
// })

app.use('/api', withSocket, Fingerprint({ parameters: [Fingerprint.useragent, Fingerprint.geoip] }));
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

module.exports = {
	emitPollData: emitPollData
};