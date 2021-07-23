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
  subject: 'Sending Email using Node.js',
  text: 'That was easy!'
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
