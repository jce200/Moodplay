var express = require("express");
var router = express.Router();
var passport = require("passport");

function checkAuthentication(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/user/login");
  }
}

router.get("/auth/isloggedin", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(req.session.passport.user);
  } else res.status(403).end();
});

router.get("/supersecret", checkAuthentication, function(req, res) {
  res.send("Secret!");
});

router.get(
  "/auth/spotify",
  passport.authenticate("spotify", {
    scope: ["user-read-email", "user-read-private", "streaming"],
    showDialog: true
  }),
  function(req, res) {
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  }
);

router.get(
  "/auth/spotify/callback",
  passport.authenticate("spotify", { failureRedirect: "/user/cancel" }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect("https://localhost:3000");
  }
);

module.exports = router;
