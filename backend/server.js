const mongoose = require("mongoose");
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
const SpotifyStrategy = require("./lib/passport-spotify/index").Strategy;
const appKey = "4184cfefa27d4bfaa7b5affd6d1e0b91";
const appSecret = "a8bbbabd663a43fc9efa6128ef4db883";

const API_PORT = 3001;
const app = express();
const router = express.Router();

// var cors = require("cors");
// app.use(
//   cors({
//     origin: "http://localhost:3000",
//     credentials: true
//   })
// );

app.use(
  require("cors")({
    credentials: true,
    origin: [
      "http://localhost:3000",
      "http://localhost:3000/",
      "localhost:3000/",
      "http://localhost:3001"
    ]
  })
);

// Extract files from form data
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

app.use(fileUpload());
app.use("/public", express.static(__dirname + "/public"));

// this is our MongoDB database
const dbRoute = "mongodb://jce200:rwsX9hN(@ds135974.mlab.com:35974/moodplay";

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// (optional) only made for logging and
// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger("dev"));

/// NEW
app.use(
  session({ secret: "keyboard cat", resave: true, saveUninitialized: true })
);
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(obj, done) {
  User.findById(obj).then(user => {
    done(null, user);
  });
});

app.use("/", require("./routes/index"));
app.use("/user", require("./routes/user"));

// [START vision_quickstart]
// Imports the Google Cloud client library
const vision = require("@google-cloud/vision");

// Creates a client
const client = new vision.ImageAnnotatorClient({
  keyFilename: "MoodPlay-eaa256002299.json"
});
//const request = { image: { source: { filename: inputFile } } };
// Performs label detection on the image file
async function main() {
  const [result] = await client.labelDetection("./images/9.jpg");

  const labels = result.labelAnnotations;

  console.log("Labels:");
  labels.forEach(label => console.log(label.description));
}
main().catch(err => {
  console.error("ERROR:", err);
});
// [END vision_quickstart]

client
  .faceDetection("./images/9.jpg")
  .then(results => {
    const faces = results[0].faceAnnotations;

    const numFaces = faces.length;
    console.log("Found " + numFaces + (numFaces === 1 ? " face" : " faces"));

    console.log("Faces:");
    faces.forEach((face, i) => {
      console.log(`  Face #${i + 1}:`);
      console.log(`    Joy: ${face.joyLikelihood}`);
      console.log(`    Anger: ${face.angerLikelihood}`);
      console.log(`    Sorrow: ${face.sorrowLikelihood}`);
      console.log(`    Surprise: ${face.surpriseLikelihood}`);
    });
  })
  .catch(err => {
    console.error("ERROR:", err);
  });

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/user/login");
  }
}

// Use the SpotifyStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, expires_in
//   and spotify profile), and invoke a callback with a user object.
passport.use(
  new SpotifyStrategy(
    {
      clientID: appKey,
      clientSecret: appSecret,
      callbackURL: `${config.baseUrl}user/auth/spotify/callback/`
    },
    function(accessToken, refreshToken, expires_in, profile, done) {
      console.log(profile);
      // asynchronous verification, for effect...
      User.findOne({ spotifyId: profile.id }).then(currentUser => {
        if (currentUser) {
          done(null, currentUser);
        } else {
          new User({
            username: profile.displayName,
            spotifyId: profile.id
          })
            .save()
            .then(newUser => {
              console.log("new user: " + newUser);
              done(null, newUser);
            });
        }
      });
    }
  )
);

//app.engine("html", consolidate.swig);

// app.get("/", function(req, res) {
//   res.render("index.hbs", { user: req.user });
// });

// app.get("/account", ensureAuthenticated, function(req, res) {
//   res.render("account.html", { user: req.user });
// });

// app.get("/login", function(req, res) {
//   res.render("login.html", { user: req.user });
// });

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback

// GET /auth/spotify
//   Use passport.authenticate() as route middleware to authenticate the
//   request. The first step in spotify authentication will involve redirecting
//   the user to spotify.com. After authorization, spotify will redirect the user
//   back to this application at /auth/spotify/callback
// app.get(
//   "/auth/spotify",
//   passport.authenticate("spotify", {
//     scope: ["user-read-email", "user-read-private", "streaming"],
//     showDialog: true
//   }),
//   function(req, res) {
//     // The request will be redirected to spotify for authentication, so this
//     // function will not be called.
//   }
// );

// app.get(
//   "/auth/spotify",
//   (req, res, next) => {
//     debugger;
//     next();
//   },
//   passport.authenticate("spotify", {
//     scope: ["user-read-email", "user-read-private"],
//     showDialog: true
//   }),
//   function(req, res) {
//     debugger;
//     // The request will be redirected to spotify for authentication, so this
//     // function will not be called.
//   }
// );
// GET /auth/spotify/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user will be redirected back to the
//   login page. Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
// app.get(
//   "/auth/spotify/callback",
//   passport.authenticate("spotify", { failureRedirect: "/login" }),
//   function(req, res) {
//     debugger; // Successful authentication, redirect home.
//     res.redirect("/kkkkkkkk");
//   }
// );

// ADD SESSION SETTINGS HERE:
app.use(
  session({
    secret: "Some kind of secret",
    resave: true,
    saveUninitialized: true
  })
);

// app.listen(8888);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed. Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

app.post("/upload", (req, res, next) => {
  let uploadFile = req.files.file;
  const fileName = req.files.file.name;
  uploadFile.mv(`${__dirname}/public/files/${fileName}`, function(err) {
    if (err) {
      return res.status(500).send(err);
    }

    res.json({
      file: `public/${req.files.file.name}`
    });
  });
});

/// NEW

// append /api for our http requests
//app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
