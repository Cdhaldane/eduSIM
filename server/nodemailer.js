const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "edusimuottawa@outlook.com",
    pass: "Legodinosaur"
  }
});

var mailOptions = {
  from: 'edusimuottawa@outlook.com',
  to: 'xcdhaldane@gmail.com',
  subject: 'EDUsim invite!',
  text: 'Hello, _____. Your teacher for class _____ is inviting you to a simulation. Your link _____ & room code ______ .'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
