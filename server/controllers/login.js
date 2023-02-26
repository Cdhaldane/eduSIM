const AdminAccount = require("../models/AdminAccounts");

// Get admin
// if email exists -> getAdminbyemail
// if not -> create admin
exports.getAdminbyEmail = async (req, res) => {
  const email = req.query.email;
  const name = req.query.name;
  const picture = req.query.picture
  console.log(picture)
  const admin = await AdminAccount.findOne({
    where: {
      email: email,
    },
  });
  try {
    if (!admin) {
      let newAdmin = await AdminAccount.create({
        email,
        name,
        picture
      });
      return res.send(newAdmin);
    }
    else {
      let adminaccount = await AdminAccount.findOne({
        where: {
          email: email,
        },
      });
      return res.send(adminaccount);
    }
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.getProfile = async (req, res) => {
  const email = req.query.email;
  console.log(req.query)
  try {
      let adminaccount = await AdminAccount.findOne({
        where: {
          email: email,
        },
      });
      return res.send(adminaccount);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.updateProfile = async (req, res) => {
  const { email, followers } = req.body;
 
  let adminaccount = await AdminAccount.findOne({
    where: {
      email: email,
    },
  });

  if (!adminaccount) {
    return res.status(400).send({
      message: `No user found with the email ${email}`,
    });
  }

  try {
    if (followers) {
      adminaccount.followers = followers;
    }

    adminaccount.save();
    return res.send({
      adminaccount: adminaccount,
      message: `User ${email} has been updated!`,
    });
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};
