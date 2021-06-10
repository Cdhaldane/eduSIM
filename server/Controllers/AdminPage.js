// All logic when the server is involved 
//Call api paths and models 
//instantiate the class, and call all the attributes of the classes
const db = require('../models').default;
const GameInstance = db.simulatordb.models.gameinstances;

exports.getGameInstance = async (req, res) => {
  res.send({
      message:"this is working!",
  });

};