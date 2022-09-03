// const db = require('../databaseConnection');
// var cloudinary = require('cloudinary').v2;
//
// cloudinary.config({
//   cloud_name: 'uottawaedusim',
//   api_key: '677391464873453',
//   api_secret: 'UZEm13qNLm3jPYC-IkumTxPLWSs'
// });
//
// var today = new Date();
// var priorDate = new Date(new Date().setDate(today.getDate() - 30));
//
// var sql = "DELETE FROM gameinstances WHERE 'updatedAt' < 'priorDate' AND status = 'deleted'";
// 
// db.sync().then(() => {
//   db.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("Number of records deleted: " + result.affectedRows);
//     });
//     let some = db.query("SELECT * FROM gameinstances WHERE 'updatedAt' < 'priorDate' AND status = 'deleted'")
//     some.then(function(result) {
//       for(let i = 0; i < result.length; i++){
//           if(result[0].length !== 0){
//           let str = (JSON.parse(result[0][i].game_parameters).images[0]?.imgsrc);
//           if(str){
//             str = str?.substring(61)
//             str = str?.slice(0, -4)
//             cloudinary.uploader.destroy('images/' + str, function(result, err) {
//               if (err){
//                 console.log(err)
//               }
//               console.log(result) });
//         }
//       }
//       }
//     })
// });
