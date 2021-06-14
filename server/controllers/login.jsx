//Logic when the server is involved
const AdminAccount = require("../models/AdminAccounts");

//Get admin account with admin id
// Request has an admin id
exports.getAdminbyId = async (req, res) => {
  const { id } = req.params;
    try {
      let adminaccount = await AdminAccount.findAll({
      where: {
        adminid: id,
      },
    });
      return res.send(adminaccount);
    } catch (err) {
      return res.status(400).send({
        message: `No admin found with the id ${id}`,
      });
    } 
  };

  //Create a new game instance
exports.createAdmin = async (req, res) => {
    const { email, name, picture } = req.body;
      try {
        let newAdmin= await AdminAccount.create({
          email,
          name,
          picture
        });
        return res.send(newAdmin);
      } catch (err) {
        return res.status(500).send({
          message: `Error: ${err.message}`,
        });
      }
    };