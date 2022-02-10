import { Router } from 'express';
const router = Router();
const nodemailer = require('nodemailer');
const db = require('../databaseConnection');
const AdminAccount = require("../models/AdminAccounts");
const Collaborators = require("../models/Collaborators");

router.post("/sendInviteEmails", async (req, res) => {
  let { simid, admin, simname, exclude } = req.body

  let smtpTransport = nodemailer.createTransport({
    service: 'hotmail',
    maxConnections: 1,
    maxMessages: 1,
    pool: true,
    auth: {
      user: "edusimuottawa@outlook.com",
      pass: "Legodinosaur"
    }
  });

  let [contacts] = await db.query(`
    select p.fname, p.lname, p.gameplayerid, p.player_email, r.gameroom_url from gameplayers p, gamerooms r where 
    p.gameinstanceid='${simid}' and 
    r.gameinstanceid='${simid}' and
    r.gameroom_name=p.game_room
  `);

  contacts = contacts.filter(({ gameplayerid }) => !exclude.includes(gameplayerid));

  for (const data of contacts) {
  
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
  
    await smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.error(error);
        res.status(400).send(error);
      } else {
        res.send('Email sent: ' + response.response);
      }
    });
  }

  // smtpTransport.close();
});

router.post("/sendCollaboratorEmails", async (req, res) => {
  let { simid, admin, emails, simname } = req.body

  let smtpTransport = nodemailer.createTransport({
    service: 'hotmail',
    maxConnections: 1,
    maxMessages: 1,
    pool: true,
    auth: {
      user: "edusimuottawa@outlook.com",
      pass: "Legodinosaur"
    }
  });

  for (const email of emails) {
  
    const adminobj = await AdminAccount.findOne({
      where: {
        email: email,
      },
    });

    let adminid = adminobj && adminobj.dataValues && adminobj.dataValues.adminid;
  
    if (!adminid) {
      let newAdmin = await AdminAccount.create({
        email
      });

      adminid = newAdmin.dataValues.adminid;
    }

    let newAdmin = await Collaborators.create({
      adminid,
      gameinstanceid: simid,
      verified: false
    });
  
    let mailOptions = {
      from: 'edusimuottawa@outlook.com',
      to: email,
      subject: `eduSIM collaboration invite from ${admin}`,
      html: `
      <table align="center" style="background-color: #fff; color: #8f001a; text-align: center;">
        <tbody><tr><td>
          <h1 style="margin: 0;">Congrats!</h1>
          <br />
          <h3 style="margin: 0;">${admin} is inviting you to collaborate on ${simname}.</h3>
          <p style="margin: 0;">You will be prompted to log into the website upon clicking the link below.<br>Please note that <b>you must log in using your current email address.</b> If you try logging in with a different account, it will not work!</p>
          <br />
          <a href="https://edusim.ca/collab-invite?sim=${simid}&email=${email}" style="width: 300px; text-decoration: none;">
          <h2 style="color: #fff; background-color: #8f001a; padding: 10px; border-radius: 10px; margin: 0;">Log in to gain access</h2>
          </a>
          <br />
          <h3 style="margin: 0;">If the link above doesn't work, copy and paste the link below in your browser:</h3>
          <p>https://edusim.ca/collab-invite?sim=${simid}&email=${email}</p>
          <br />
          <h4 style="margin: 0;">The eduSIM Team</h4>
        </td></tr></tbody>
      </table>
      `
    };
  
    await smtpTransport.sendMail(mailOptions, (error, response) => {
      if (error) {
        console.error(error);
        res.status(400).send(error);
      } else {
        res.send('Email sent: ' + response.response);
      }
    });
  }

  // smtpTransport.close();
});

export default router;
