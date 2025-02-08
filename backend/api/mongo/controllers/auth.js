const config = require("../../config/index");
const moment = require("moment-timezone");
var jwt = require("jsonwebtoken"),
  async = require("async"),
  bcrypt = require("bcrypt"),
  crypto = require("crypto"),
  MailConfig = require("./email"),
  mailTransporter = MailConfig.SelectEmailTransport(),
  sender = config.transport.sender;
const UserModel = require("../models/user");
/**
 * Sign in
 */
exports.sign_in = function (req, res) {
  UserModel.findOne({
    username: req.body.username,
  }).exec(function (err, user) {
    if (!err && user && user.comparePassword(req.body.password)) {
      let token = jwt.sign({ username: user.username }, config.secret, {
        expiresIn: 604800,
      });
      user.token = token;
      user.save();
      return res.status(200).json({
        id: user._id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
        token: token,
        active_start: user.active_start,
        active_end: user.active_end,
        active: user.active,
        display_role: user.display_role,
        employee_id: user.employee_id,
        branch_id: user.branch_id,
        avatar_path: user.avatar_path,
      });
    } else {
      return res.status(400).send({
        message: "auth-failed",
      });
      //Password reset token is invalid or has expired.
    }
  });
};
exports.sign_out = function (req, res) {
  UserModel.findOne({
    username: req.body.username,
  }).exec(function (err, user) {
    if (!err && user) {
      user.token = "";
      user.save();
      return res.status(200).json({ success: true });
    } else {
      return res.status(400).send({
        message: "auth-failed",
      });
      //Password reset token is invalid or has expired.
    }
  });
};
/**
 * Forget password
 */
exports.user_forgot_password = function (req, res, next) {
  // console.log(environment.EXTERNAL_API + '/test/persionids/' + req.params.paramId);
  //console.log(req.body);
  /*UserModel.find({
   username: req.body.username,
   email: req.body.email
  })
  .exec()
  .then(results => {
   // console.log(results);
     return res.status(200).json( { status: results.length == 1});
  })
  .catch(err => {
     return res.status(411).send({ status: false});
  });*/
  console.log(req.body);
  async.waterfall(
    [
      function (done) {
        UserModel.findOne({
          username: req.body.username,
          email: req.body.email,
        }).exec(function (err, user) {
          console.log(err);
          if (user) {
            done(err, user);
          } else {
            done("mail-not-found");
          }
        });
      },
      function (user, done) {
        // create the random token
        crypto.randomBytes(20, function (err, buffer) {
          var token = buffer.toString("hex");
          done(err, user, token);
        });
      },
      function (user, token, done) {
        UserModel.findByIdAndUpdate(
          { _id: user._id },
          {
            reset_password_token: token,
            reset_password_expires: Date.now() + 86400000,
          },
          { upsert: true, new: true }
        ).exec(function (err, new_user) {
          done(err, token, new_user);
        });
      },
      function (token, user, done) {
        console.log(token);
        var data = {
          template: "forgetPassword",
          message: {
            from: sender,
            to: user.email,
          },
          locals: {
            url: config.frontendroot + "/reset-password?token=" + token,
            name: user.username,
          },
        };

        MailConfig.emailTransport(mailTransporter)
          .send(data)
          .then((info) => {
            console.log("email is send");
            //console.log(info);
            return res.json({ status: true, message: "mail-send" });
          })
          .catch((err) => {
            console.log(err);
            return done("mail-send-failed");
          });
      },
    ],
    function (err) {
      console.log(err);
      return res.status(422).send({ status: false, message: err });
    }
  );
};

exports.user_change_password = function (req, res, next) {
  // console.log(environment.EXTERNAL_API + '/test/persionids/' + req.params.paramId);
  //console.log(req.body);
  UserModel.findOne({
    username: req.body.username,
    email: req.body.email,
  }).exec(function (err, user) {
    if (!err && user) {
      //START add code check exist password before change 2020/04/18 Cachen C.
      if (!user.comparePassword(req.body.old_password)) {
        return res.status(400).send({
          success: false,
          message: "incorrect old password",
        });
      }
      //END add code check exist password before change

      user.hash_password = bcrypt.hashSync(req.body.password, 10);
      user.modified = moment().tz("Asia/Bangkok").format("M/D/YYYY HH:mm:ss");
      user
        .save()
        .then((result) => {
          return res.status(200).json({ success: true });
        })
        .catch((err) => {
          return res.status(400).send({
            success: false,
            message: "change-password-failed",
          });
        });
    } else {
      return res.status(400).send({
        success: false,
        message: "change-password-find-user-failed",
      });
      //Password reset token is invalid or has expired.
    }
  });
};
/**
 * Reset password
 */
exports.user_reset_password = function (req, res, next) {
  // console.log(environment.EXTERNAL_API + '/test/persionids/' + req.params.paramId);
  //console.log(req.body);
  //console.log(req.params.paramId);
  /*UserModel.
  findById(req.params.paramId)
  .exec(function(err, user) {
    //console.log(user);
    //console.log(err);
    if (!err && user && user.comparePassword(req.body.password)) {
      //console.log("save");
      user.password = bcrypt.hashSync(req.body.newpassword, 10);
      user.modified = moment().tz('Asia/Bangkok').format('M/D/YYYY HH:mm:ss');
      user
          .save()
          .then(result => {
            return res.status(200).json({ success: true});
          })
          .catch(err => {
            console.log(err);
            return res.status(400).send({
              success: false,
              message: 'reset-password-failed'
            });
          });
        
    } else {
      return res.status(400).send({
        success: false,
        message: 'reset-password-failed'
      });
      //Password reset token is invalid or has expired.
    }
  });*/

  UserModel.findOne({
    reset_password_token: req.body.token,
    reset_password_expires: {
      $gt: Date.now(),
    },
  }).exec(function (err, user) {
    if (!err && user) {
      if (req.body.newPassword === req.body.verifyPassword) {
        user.hash_password = bcrypt.hashSync(req.body.newPassword, 10);
        user.reset_password_token = undefined;
        user.reset_password_expires = undefined;
        user.save(function (err) {
          if (err) {
            return res.status(422).send({
              message: "reset-password-failed",
            });
          } else {
            var data = {
              template: "resetPassword",
              message: {
                from: sender,
                to: user.email,
              },
              locals: {
                name: user.username,
              },
            };

            MailConfig.emailTransport(mailTransporter)
              .send(data)
              .then((info) => {
                console.log("email is send");
                //console.log(info);
                return res.json({ status: true, message: "mail-send" });
              })
              .catch((error) => {
                //console.log(err);
                //return done('mail-send-failed');
                return res.status(422).send({
                  status: false,
                  message: "mail-send-failed",
                });
              });
          }
        });
      } else {
        return res.status(422).send({
          status: false,
          message: "password-not-match",
        });
      }
    } else {
      return res.status(400).send({
        status: false,
        message: "token-invalid-expire",
      });
      //Password reset token is invalid or has expired.
    }
  });
};

exports.leave_request_notification = function (req, res, next) {
  //console.log(req.body);
  async.waterfall(
    [
      function (done) {
        //console.log(req.body.manager_email);
        var data = {
          template: "leaveRequestNotification",
          message: {
            from: sender,
            to: req.body.manager_email,
          },
          locals: {
            name: req.body.employee_name,
          },
        };

        MailConfig.emailTransport(mailTransporter)
          .send(data)
          .then((info) => {
            console.log("email is send");
            //console.log(info);
            return res.json({ status: true, message: "mail-send" });
          })
          .catch((err) => {
            console.log(err);
            return done("mail-send-failed");
          });
      },
    ],
    function (err) {
      console.log(err);
      return res.status(422).send({ status: false, message: err });
    }
  );
};
