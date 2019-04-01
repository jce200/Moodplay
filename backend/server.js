const mongoose = require("mongoose");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const Data = require("./data");
const User = require("./models/user");
var cookieParser = require("cookie-parser");
var config = require("./config.json");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const passport = require("passport");
const axios = require("axios");
const SpotifyStrategy = require("./lib/passport-spotify/index").Strategy;
const appKey = "4184cfefa27d4bfaa7b5affd6d1e0b91";
const appSecret = "a8bbbabd663a43fc9efa6128ef4db883";
const API_PORT = 3001;
const app = express();
const router = express.Router();
const serveStatic = require("serve-static");

// const fs = require("fs");
// const http = require("http");
// const https = require("https");

// // Certificate
// const privateKey = fs.readFileSync(
//   "/etc/letsencrypt/live/www.upcharge.nl/privkey.pem",
//   "utf8"
// );
// const certificate = fs.readFileSync(
//   "/etc/letsencrypt/live/www.upcharge.nl/cert.pem",
//   "utf8"
// );
// const ca = fs.readFileSync(
//   "/etc/letsencrypt/live/www.upcharge.nl/chain.pem",
//   "utf8"
// );

// const credentials = {
//   key: privateKey,
//   cert: certificate,
//   ca: ca
// };

// if (config.environment == "production") {
app.use(express.static(path.join(__dirname, "moodplay")));
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "moodplay", "index.html"));
});
// }

// app.use(
//   require("cors")({
//     credentials: true,
//     origin: [
//       "http://localhost:3000",
//       "http://localhost:3000/",
//       "localhost:3000/",
//       "http://localhost:3001"
//     ]
//   })
// );

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// app.use("/public", express.static(__dirname + "/public"));

const dbRoute = "mongodb://jce200:rwsX9hN(@ds135974.mlab.com:35974/moodplay";

mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));
db.on("error", console.error.bind(console, "MongoDB connection error:"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  User.findOne({ spotifyId: user.spotifyId }).then(userFound => {
    done(null, user);
  });
});

app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));

// Imports the Google Cloud client library
const vision = require("@google-cloud/vision");

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "MoodPlay-37ae218d42c3.json"
});

app.post("/upload", upload.single("file"), function(req, res, next) {
  client
    .faceDetection(req.file.path)
    .then(results => {
      const faces = results[0].faceAnnotations;

      const numFaces = faces.length;
      console.log("Found " + numFaces + (numFaces === 1 ? " face" : " faces"));

      res.send(JSON.stringify(results));
      // return Promise.resolve(results);
    })
    // .then(response => {
    //   console.log(response);
    //   res.json(response.data.tracks);
    // })
    .catch(err => {
      console.error("ERROR:", err);
    });
});

app.post("/playmood", function(req, res, next) {
  let token = req.session.passport.user.accessToken;
  let min_valence = req.body.min_valence;
  let max_valence = req.body.max_valence;
  let min_danceability = req.body.min_danceability;
  let max_danceability = req.body.max_danceability;
  // // let min_loudness = req.body.min_loudness;
  // // let max_loudness = req.body.max_loudness;
  // let min_tempo = req.body.min_tempo;
  // let max_tempo = req.body.max_tempo;

  let moodUrl =
    "https://api.spotify.com/v1/recommendations?limit=80&seed_genres=dance%2Celectronic%2Cpop%2Chouse%2Ctrance";

  moodUrl += `&min_danceability=${min_danceability}&max_danceability=${max_danceability}`;
  // // moodUrl += `&min_loudness=${min_loudness}&max_loudness=${max_loudness}`;
  // moodUrl += `&min_tempo=${min_tempo}&max_tempo=${max_tempo}`;
  moodUrl += `&min_valence=${min_valence}&max_valence=${max_valence}`;

  axios
    .get(moodUrl, { headers: { Authorization: "Bearer " + token } })
    .then(result => {
      var i = Math.floor(Math.random() * 50) + 1;
      console.log(i);
      console.log("testtest test test" + result.data.tracks[i].preview_url);
      while (
        result.data.tracks[i].preview_url === null ||
        result.data.tracks[i].preview_url === undefined
      ) {
        i++;
      }
      console.log(
        `Track #${i} is the first track with a preview URL ${
          result.data.tracks[i].preview_url
        }`
      );

      res.json(result.data.tracks[i].preview_url);
    })
    .catch(err => {
      console.error("ERROR:", err);
    });
});

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/user/login");
  }
}

passport.use(
  new SpotifyStrategy(
    {
      clientID: appKey,
      clientSecret: appSecret,
      callbackURL: `${config.baseUrl}user/auth/spotify/callback/`
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      User.findOneAndUpdate(
        { spotifyId: profile.id },
        { accessToken: accessToken }
      ).then(currentUser => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          new User({
            username: profile.displayName,
            spotifyId: profile.id,
            accessToken: accessToken
          })
            .save()
            .then(newUser => {
              // console.log("new user: " + newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.get("/logout", function(req, res) {
  req.logout();
  req.session.destroy(function(err) {
    if (!err) {
      res
        .status(200)
        .clearCookie("connect.sid", { path: "/" })
        .json({ status: "Success" });
    } else {
      // handle error case...
    }
  });
});

// UPLOAD PICTURES TO FOLDER
// app.post("/uploadINFOLDER", (req, res, next) => {
//   let uploadFile = req.files.file;
//   const fileName = req.files.file.name;
//   uploadFile.mv(`${__dirname}/public/files/${fileName}`, function(err) {
//     if (err) {
//       return res.status(500).send(err);
//     }

//     res.json({
//       file: `public/${req.files.file.name}`
//     });
//   });
// });

app.use(serveStatic(path.join(__dirname, "public")));
// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));

// PRODUCTION

// const httpServer = http.createServer(app);
// const httpsServer = https.createServer(credentials, app);

// httpServer.listen(80, () => {
//   console.log("HTTP Server running on port 80");
// });

// httpsServer.listen(443, () => {
//   console.log("HTTPS Server running on port 443");
// });
