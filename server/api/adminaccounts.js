var express = require('express');
var Adminaccounts = require('../models/adminaccounts');

var router = express.Router();

router.get('/', (req, res) => {
  Adminaccounts.retrieveAll((err, accounts) => {
    if (err)
      return res.json(err);
    return res.json(accounts);
  });
});

router.post('/', (req, res) => {
  var adminaccounts = req.body.adminaccounts;

  Adminaccounts.insert(adminaccounts, (err, result) => {
    if (err)
      return res.json(err);
    return res.json(result);
  });
});

module.exports = router;
