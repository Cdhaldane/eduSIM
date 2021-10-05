import { Router } from 'express';
const router = Router();
const nodemailer = require('nodemailer');
const db = require('../databaseConnection');

router.post("/sendInviteEmails", async (req, res) => {
  let { simid, admin, simname } = req.body
  let error = true;

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
      subject: `eduSIM invite from ${admin}`,
      html: `
      <table align="center" style="background-color: #fff; color: #8f001a; text-align: center;">
        <tbody><tr><td>
          <h1 style="margin: 0;">Hi, ${data.fname} ${data.lname}</h1>
          <br />
          <h3 style="margin: 0;">${admin} is inviting you to join ${simname}.</h3>
          <br />
          <a href="https://edusim.ca/gamepage/${data.gameroom_url}?user=${data.gameplayerid}" style="width: 300px; text-decoration: none;">
          <h2 style="color: #fff; background-color: #8f001a; padding: 10px; border-radius: 10px; margin: 0;">Join game</h2>
          </a>
          <br />
          <h3 style="margin: 0;">If the link above doesn't work, copy and paste the link below in your browser:</h3>
          <p>https://edusim.ca/gamepage/${data.gameroom_url}?user=${data.gameplayerid}</p>
          <br />
          <h3 style="margin: 0;">Enjoy!</h3>
          <br />
          <h4 style="margin: 0;">The eduSIM Team</h4>
        </td></tr></tbody>
      </table>
      `
    };
  
    smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        res.status(400).send(error);
      } else {
        res.send('Email sent: ' + response.response)
      }
    });
  })

  smtpTransport.close();
});

export default router;
