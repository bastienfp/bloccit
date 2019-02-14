const userQueries = require("../db/queries.users.js");
const passport = require("passport");

module.exports = {
  signUp(req, res, next){
    res.render("users/sign_up");
  },

  create(req, res, next){
    let newUser = {
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };

    userQueries.getUser(newUser.email, (err, user) => {
      if(user !== null){
        req.flash("notice", "This email is already used!");
        res.redirect("/users/sign_up");
      } else {
        userQueries.createUser(newUser, (err, user) => {
          if(err){
            console.log(err);
            req.flash("error", err);
            res.redirect("/users/sign_up");
          } else {
            passport.authenticate("local")(req, res, () => {
              req.flash("notice", "You've successfully signed in!");
              res.redirect("/");
            })
          }
        });
      }
    });
  },

  signInForm(req, res, next){
    res.render("users/sign_in");
  },

  // signIn(req, res, next){
  //   passport.authenticate("local")(req, res, () => {
  //     console.log(err);
  //     console.log(user);
  //     if(!user){
  //       req.flash("notice", "Sign in failed. Please try again.");
  //       res.redirect("/users/sign_in");
  //     } else {
  //       req.flash("notice", "You've successfully signed in!");
  //       res.redirect("/");
  //     }
  //   })
  // },

  signIn(req, res, next){
    passport.authenticate('local', function(err, user, info) {
      if (err) {
        return next(err);
      }
      //console.log(user);
      //console.log(info);
      if (!user) {
        req.flash("notice", "Sign in failed. Please try again.");
        return res.redirect('/users/sign_in');
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        req.flash("notice", "You've successfully signed in!");
        return res.redirect('/');
      });
    })(req, res, next);
  },

  signOut(req, res, next){
    req.logout();
    req.flash("notice", "You've successfully signed out!");
    res.redirect("/");
  }

}
