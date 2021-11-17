// for running the react app build
// use "npm run prod" after running "npm run build"

let path = require("path");
let express = require("express");

let DIST_DIR = path.join(__dirname, "build");
let PUBLIC_DIR = path.join(__dirname, "public");
let PORT = 3000;
let app = express();

app.use(express.static(DIST_DIR));
app.use(express.static(PUBLIC_DIR));

app.get("*", function (req, res) {
  res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`frontend listening on ${PORT}`)
});