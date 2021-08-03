import { Router } from 'express';
const router = Router();
const multer = require('multer');
const nodemailer = require('nodemailer');

router.post("/sendEmail", (req,res) =>{
  let data = req.body
  console.log(data)
  console.log(data.email)
  let smtpTransport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: "edusimuottawa@outlook.com",
      pass: "Legodinosaur"
    }
  });
  var mailOptions = {
    from: 'edusimuottawa@outlook.com',
    to: data.email,
    subject: 'EDUsim invite!',
    html:`
    <h3>You have been invited to a simulation!</h3>
      <h1>Prof Information</h1>
        <ul>
          <li> Name: Bob Builder </li>
          <li> Email: bobbyboo@gmaile.com</li>
        </ul>
      <h1>Information</h1>
        <ul>
          <li> Name: ${data.name} ${data.lastname} </li>
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
      res.send('Email sent: ' + response.response)
    }
  })
  smtpTransport.close();
})

export default router;
