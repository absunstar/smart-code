module.exports = function init(site) {
  site.get({
    name: "manage_user",
    path: __dirname + "/site_files/html/index.html",
    parser: "html",
    compress: false,
  });

  site.get({
    name: "/images",
    path: __dirname + "/site_files/images",
  });

  site.post("/api/manage_user/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "Please Login First";
      res.json(response);
      return;
    }

    
    let type = req.body.type;
    site.security.getUser(
      {
        email: req.body.user.email,
      },
      (err, user) => {
        if (!err && user) {

          if (type === "email") {
            if (!req.body.user.email.contains("@") && !req.body.user.email.contains(".")) {
              user.email = req.body.user.email + "@" + site.get_company(req).host;
            } else {
              if (req.body.user.email.contains("@") && !req.body.user.email.contains(".")) {
                response.error = "Email must be typed correctly";
                res.json(response);
                return;
              } else if (
                !req.body.user.email.contains("@") &&
                req.body.user.email.contains(".")
              ) {
                response.error = "Email must be typed correctly";
                res.json(response);
                return;
              }
            }
          } else if (type === "password") {
            if (req.body.user.current_password !== user.password) {
              response.error = "Current Password Error";
              res.json(response);
              return;
            } else if (req.body.user.re_password !== req.body.user.new_password) {
              response.error = "Password does not match";
              res.json(response);
              return;
            } else {
              user.password = req.body.user.new_password;
            }
          }

          site.security.isUserExists(req.body.user, function (err, user_found) {
            if (user_found && type === "email") {
              response.error = "User Is Exist";
              res.json(response);
              return;
            }

            site.security.updateUser(user, (err, user_doc) => {
              response.done = true;
              response.doc = user_doc.doc;
              response.doc.company = site.get_company(req);
              response.doc.branch = site.get_branch(req);
              res.json(response);
            });
          });
        } else {
          response.error = err ? err.message : "no doc";
        }
      }
    );
  });
};
