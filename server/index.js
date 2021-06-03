const path = require('path'); 
const express = require('express');
const bodyParser = require('body-parser');

var db = require('./databaseConnection')

const ENV = process.env.NODE_ENV; //Tells us if we're working in development or production
const PORT = process.env.PORT || 5000;

//Initialising express and registering the basic middleware
const app = express();
app.use(express.json()); //-> allows us to access the req.body
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/apis/gameinstances', require('./apis/gameInstance'));
app.use('/apis/games', require('./apis/game'));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

db.query('SELECT NOW()', (err, res) => {
  if (err.error)
    return console.log(err.error);
  console.log(`PostgreSQL connected: ${res[0].now}.`);
});

module.exports = app;

