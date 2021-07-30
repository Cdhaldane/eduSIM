require('dotenv').config()
import helmet from 'helmet';

import routes from './routes';
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const nodemailer = require('nodemailer');

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

app.use((req, res) => {
  res.status(404).send('404: Page not found');
});

app.post("/api/form", (req,res) =>{
  let data = req.body
  let smtpTransport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: "edusimuottawa@outlook.com",
      pass: "Legodinosaur"
    }
  });
  var mailOptions = {
    from: 'edusimuottawa@outlook.com',
    to: 'xcdhaldane@gmail.com',
    subject: 'EDUsim invite!',
    html:`
    <h3>You have been invited to a simulation!</h3>
      <h1>Prof Information</h1>
        <ul>
          <li> Name: ${data.pname} </li>
          <li> Email: ${data.pemail} </li>
        </ul>
      <h1>Information</h1>
        <ul>
          <li> Name: ${data.name} </li>
          <li> Email: ${data.email} </li>
          <li> Link: ${data.link} </li>
          <li> Room Code: ${data.roomcode} </li>
        </ul>
    `
  };
  smtpTransport.sendMail(mailOptions, (error,response) =>{

    if(error){
      res.send(error)
    } else {
      res.send('Success')
    }
  })
  smtpTransport.close();
})


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}!`);
});

module.exports = app;
