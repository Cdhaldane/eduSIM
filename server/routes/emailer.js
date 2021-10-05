import { Router } from 'express';
const router = Router();
const nodemailer = require('nodemailer');
const db = require('../databaseConnection');

router.post("/sendInviteEmails", async (req, res) => {
  let { simid, admin, simname } = req.body

  let smtpTransport = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
      user: "edusimuottawa@outlook.com",
      pass: "Legodinosaur"
    }
  });

  const [contacts] = await db.query(`
    select p.fname, p.lname, p.gameplayerid, p.player_email, r.gameroom_url from gameplayers p, gamerooms r where 
    p.gameinstanceid='${simid}' and 
    r.gameinstanceid='${simid}' and
    r.gameroom_name=p.game_room
  `);

  contacts.forEach(async (data) => {
  
    let mailOptions = {
      from: 'edusimuottawa@outlook.com',
      to: data.player_email,
      subject: 'EDUsim invite!',
      html: `
      <div style="background-color: #fff; color: #8f001a;">
      <h1 style="margin: 0;">Hi ${data.fname} ${data.lname}</h1>
      <br />
      <h2 style="margin: 0;">${admin} is inviting you to join
      ${simname}.
       To join the simulation please click the personalized link below:</h2>
       <br />
       <a href="https://edusim.ca/gamepage/${data.gameroom_url}?user=${data.gameplayerid}">
       <h2 style="margin: 0;">Link</h2>
       </a>
       <br />
       <h2 style="margin: 0;">If the link above doesn't work, copy and paste the link in your favourite browser.</h2>
       <br />
       <h2 style="margin: 0;">Enjoy!</h2>
       <br />
       <h2 style="margin: 0;">The eduSIM Team</h2>
      </div>
      `
    };
  
    smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        res.send(error)
      } else {
        res.send('Email sent: ' + response.response)
      }
    });
  })

  smtpTransport.close();
});

export default router;
