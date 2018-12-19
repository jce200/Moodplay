var mongoose = require("mongoose");

var UserSchema = new mongoose.Schema({
  username: String,
  spotifyId: String,
  accessToken: String
});

// UserSchema.statics.findOrCreate = function findOrCreate(profile, cb) {
//   var userObj = new this();
//   this.findOne({ _id: profile.id }, function(err, result) {
//     if (!result) {
//       userObj.username = profile.displayName;
//       //....
//       userObj.save(cb);
//     } else {
//       cb(err, result);
//     }
//   });
// };

module.exports = mongoose.model("User", UserSchema);
