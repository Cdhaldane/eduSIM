const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "edusimuottawa@outlook.com",
    pass: "Legodinosaur"
  }
});

let mailOptions = {
  from: 'edusimuottawa@outlook.com',
  to: 'xcdhaldane@gmail.com',
  subject: 'EDUsim invite!',
  text: 'Hello, _____. Your teacher for class _____ is inviting you to a simulation. Your link _____ & room code ______ .'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
