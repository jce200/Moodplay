var express = require("express");
var router = express.Router();
var passport = require("passport");

function checkAuthentication(req, res, next) {
  debugger;
  if (req.isAuthenticated()) {
    debugger;
    next();
  } else {
    debugger;
    res.redirect("/user/login");
  }
}
/* GET home page. */
router.post("/login", passport.authenticate("local"), function(req, res, next) {
  debugger;
  res.redirect("/");
});

router.post(
  "/login-react",
  (req, res, next) => {
    debugger;
    next();
  },
  passport.authenticate("local"),
  (req, res) => {
    debugger;
    res.send(200);
  }
);

router.get("/profile", checkAuthentication, function(req, res) {
  res.send("profile" + req.session.passport.user.username);
});

router.get("/login", function(req, res) {
  res.send(`

        <form method="POST" action="/user/login">
            <input name="password" value="password"/>
            <input name="username" value="username"/>
            <input type='submit' value='submit' />
        </form>
    
    `);
});

router.get("/auth/isloggedin", (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).end();
  } else res.status(403).end();
});

router.get("/supersecret", checkAuthentication, function(req, res) {
  res.send("Secret!");
});

router.get("/auth/spotify", passport.authenticate("spotify"));
router.get(
  "/auth/spotify/callback/",
  (req, res, next) => {
    debugger;
    next();
  },
  passport.authenticate("spotify"),
  function(req, res) {
    // debugger;
    // res.send("Authenticated with SLACK!")
    res.redirect("http://localhost:3000/");
  }
);

// router.post("/logout", function(req, res) {
//   req.session.destroy(function(err) {
//     res.status(200).json({ message: "Log out success!" });
//     res.redirect("/"); //Inside a callback… bulletproof!
//   });
// });

// router.get("/auth/slack", passport.authenticate("slack"));
// router.get("/auth/slack/callback", passport.authenticate("slack"), function(req, res){
//     debugger
//     // res.send("Authenticated with SLACK!")
//     res.redirect("http://localhost:3000")
// });

// router.get("/auth/facebook", passport.authenticate("facebook"));
// router.get(
//   "/auth/facebook/callback",
//   passport.authenticate("facebook", {
//     successRedirect: "/",
//     failureRedirect: "/login"
//   })
// );
module.exports = router;
