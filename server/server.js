require('dotenv').config()
import helmet from 'helmet';

import routes from './routes';
import events from './events';
import clean from './routes/dbCleanup'
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

let cors = require('cors')

const ENV = process.env.NODE_ENV  //Tells us if we're working in development or production
const PORT = process.env.PORT || 5050;

//Initialising express and registering the basic middleware
const app = express();
app.use(cors()); // Use this after the variable declaration
app.use(helmet());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb',
  parameterLimit: 100000,
  extended: true }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(fileUpload());

app.use('/api/gameinstances', routes.gameinstance);
app.use('/api/adminaccounts', routes.adminaccount);
app.use('/api/email', routes.emailer);
app.use('/api/gameroles', routes.gamerole);
app.use('/api/playerrecords', routes.playerrecord);
app.use('/api/image', routes.image);
app.use('/api/video', routes.video);

app.use((req, res) => {
  res.status(404).send('404: Page not found');
});

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: true,
    credentials: true
  },
});

io.on("connection", (socket) => events(io, socket));


httpServer.listen(PORT, () => {

  console.log(`Server listening on portt ${PORT}!`);
});

module.exports = app;
