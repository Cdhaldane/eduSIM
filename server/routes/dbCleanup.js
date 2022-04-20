const db = require('../databaseConnection');

var sql = "DELETE FROM gameinstances WHERE updatedAt (< DATEADD(day, -30, GETDATE()) AND status = deleted)";
const cleanUp = db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
  });

db.sync().then(() => {
  console.log('Deleted old gameinstances');
});

module.exports = cleanUp;
