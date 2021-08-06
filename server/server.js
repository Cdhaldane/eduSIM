require('dotenv').config()
import helmet from 'helmet';

import routes from './routes';
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');


var cors = require('cors')



const ENV = process.env.NODE_ENV  //Tells us if we're working in development or production
const PORT = process.env.PORT || 5000;

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

app.use((req, res) => {
  res.status(404).send('404: Page not found');
});



app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

module.exports = app;
