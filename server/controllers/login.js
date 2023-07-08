const AdminAccount = require("../models/AdminAccounts");

// Get admin
// if email exists -> getAdminbyemail
// if not -> create admin
exports.getAdminbyEmail = async (req, res) => {
  const email = req.query.email;
  const name = req.query.name;

  const admin = await AdminAccount.findOne({
    where: {
      email: email,
    },
  });
  console.log(admin)
  try {
    if (!admin) {
      let newAdmin = await AdminAccount.create({
        email,
        name,
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
  const idType = req.params.param;
  const id = req.params.value;

  try {
    let adminaccount;
    if (idType === 'email') {
      adminaccount = await AdminAccount.findOne({
        where: {
          email: id,
        },
      });
    } else if (idType === 'adminid') {
      adminaccount = await AdminAccount.findOne({
        where: {
          adminid: id,
        },
      });
    } else {
      return res.status(400).send({
        message: `Invalid id type: ${idType}`,
      });
    }
    if (!adminaccount) {
      return res.status(404).send({
        message: `Admin account with ${idType} '${id}' not found`,
      });
    }
    return res.send(adminaccount);
  } catch (err) {
    return res.status(500).send({
      message: `Error: ${err.message}`,
    });
  }
};

exports.getName = async (req, res) => {
  const adminid = req.query.adminid;
  try {
      let adminaccount = await AdminAccount.findOne({
        where: {
          adminid: adminid,
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
  const { email, followers, picture, bannerPath, likedSims, downloadedSims, following } = req.body;

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
    if (picture) {
      adminaccount.picture = picture;
    }
    if (bannerPath) {
      adminaccount.bannerPath = bannerPath;
    }
    if (likedSims) {
      adminaccount.likedSims = likedSims;
    }
    if (downloadedSims) {
      adminaccount.downloadedSims = downloadedSims;
    }
    if (following) {
      adminaccount.following = following;
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
