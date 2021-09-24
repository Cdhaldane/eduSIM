require('dotenv').config()
import helmet from 'helmet';

import routes from './routes';
import events from './events';
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

let cors = require('cors')

const ENV = process.env.NODE_ENV  //Tells us if we're working in development or production
const PORT = process.env.PORT || 5050;

//Initialising express and registering the basic middleware
const app = express();
app.use(cors()) // Use this after the variable declaration
app.use(helmet());
app.use(express.json()); //-> allows us to access the req.body
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(fileUpload());

app.use('/api/gameinstances', routes.gameinstance)
app.use('/api/adminaccounts', routes.adminaccount)
app.use('/api/email', routes.emailer)
app.use('/api/gameroles', routes.gamerole)
app.use('/api/playerrecords', routes.playerrecord)
app.use('/api/image', routes.image)

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
  console.log(`Server listening on port ${PORT}!`);
});

module.exports = app;
