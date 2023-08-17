require('dotenv').config()
import helmet from 'helmet';

import routes from './routes';
import events from './events';
import clean from './routes/dbCleanup'
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');


let cors = require('cors')

const ENV = process.env.NODE_ENV  //Tells us if we're working in development or production
const PORT = process.env.PORT || 8080;


//Initialising express and registering the basic middleware
const app = express();

const corsOptions = {
  origin: ['http://localhost:3000', 'https://edusim.ca', "https://reactapp-jyfluau3gq-uc.a.run.app", "https://react-frontend-socurjfina-uc.a.run.app", "https://hgjdchierhxsyosxrfqi.supabase.co"],
  optionsSuccessStatus: 200,
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({
  limit: '50mb',
  parameterLimit: 100000,
  extended: true
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(fileUpload());

app.use('/api/gameinstances', routes.gameinstance);
app.use('/api/adminaccounts', routes.adminaccount);
app.use('/api/email', routes.emailer);
app.use('/api/gameroles', routes.gamerole);
app.use('/api/playerrecords', routes.playerrecord);
app.use('/api/image', routes.image);
app.use('/api/video', routes.video);

app.use((req, res) => {
  res.status(404).send('404: Page not found');
});

const httpServer = require("http").createServer(app);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: true,
    credentials: true
  },
});

io.on("connection", (socket) => events(io, socket));
io.eio.pingTimeout = 320000; // 2 minutes
io.eio.pingInterval = 10000;  // 5 seconds

io.on("connection", (socket) => {
  socket.on('disconnect', function () {
    console.log('Got disconnect!');
  });
  socket.on("disconnecting", (reason) => {
    for (const room of socket.rooms) {
      if (room !== socket.id) {
        socket.to(room).emit("errorLog", { key: "alert.noUpdateGameXInProgress", params: { game: socket.id } });
      }
    }
  });
});


if (process.env.STATUS === 'production') {
  // Redirect HTTP requests to HTTPS
  app.enable("trust proxy");
  app.use((req, res, next) => {
    console.log("https://" + req.headers.host + req.url);
    console.log(req.secure);
    req.secure ? next() : res.redirect("https://" + req.headers.host + req.url);
  });

  const privateKey = fs.readFileSync(
    path.join(__dirname, `/etc/letsencrypt/live/edusim.ca/privkey.pem`),
    "utf8"
  );
  const certificate = fs.readFileSync(
    path.join(__dirname, `/etc/letsencrypt/live/edusim.ca/fullchain.pem`),
    "utf8"
  );
  const httpsServer = https.createServer(
    {
      key: privateKey,
      cert: certificate,
    },
    app
  );
  
  httpsServer.listen(PORT, () =>
    console.log(`HTTPS server started on PORT=${PORT}`)
  );
}



module.exports = app;
