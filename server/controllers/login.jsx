//Logic when the server is involved
const AdminAccount = require("../models/AdminAccounts");

  //Get admin
  //if email exists -> getAdminbyemail
  //if not -> create admin
  exports.getAdminbyEmail = async (req, res) => {
    const email = req.query.email;
    const name = req.query.name;


    const admin = await AdminAccount.findOne({
      where: {
        email: email,
      },
    });
    try {
      if (!admin) {
        let newAdmin= await AdminAccount.create({
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
