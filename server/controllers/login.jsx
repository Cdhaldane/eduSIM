//Logic when the server is involved
const AdminAccount = require("../models/AdminAccounts");

  //Get admin
  //if email exists -> getAdminbyemail
  //if not -> create admin
  exports.getAdminbyEmail = async (req, res) => {
<<<<<<< HEAD
    const email = req.query.email;
    const name = req.query.name;

=======
    const { email, name } = req.params;
    
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af
    const admin = await AdminAccount.findOne({
      where: {
        email: email,
      },
    });
<<<<<<< HEAD
=======
      
    
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af
    try {
      if (!admin) {
        let newAdmin= await AdminAccount.create({
          email,
          name,
        });
        return res.send(newAdmin);
<<<<<<< HEAD
      }
=======
      } 
>>>>>>> b529ada54d18fc84242bf30206391695610ff3af
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
