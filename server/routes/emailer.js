import { Router } from 'express';
const router = Router();
const multer = require('multer');
const nodemailer = require('nodemailer');

router.post("/sendEmail", (req,res) =>{
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
    to: data.email,
    subject: 'EDUsim invite!',
    html:`
    <div style="background-color: #fff; color: #8f001a;">
    <h1 style="margin: 0;">Hi ${data.name} ${data.lastname}</h1>
    <br />
    <h2 style="margin: 0;">${data.pname} is inviting you to join
    ${data.title } on [Date] at [Time].
     To join the simulation please click the personalized link below:</h2>
     <br />
     <h2 style="margin: 0;">Link</h2>
     <br />
     <h2 style="margin: 0;">If the link above doesn't work, copy and paste the link in your favourite browser.</h2>
     <br />
     <h2 style="margin: 0;">Enjoy!</h2>
     <br />
     <h2 style="margin: 0;">The eduSIM Team</h2>
    </div>


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
