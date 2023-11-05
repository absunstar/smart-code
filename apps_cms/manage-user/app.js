module.exports = function init(site) {
  site.get({
    name: 'manageUser',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });
  site.get('/api/user/update-visit-date', (req, res) => {
    if (req.session.user) {
      req.session.user.visit_date = new Date();
      site.security.updateUser(req.session.user, (err, result) => {});
      res.json({ done: true });
    } else {
      res.json({ done: false });
    }
  });

  site.post('/api/user/follow_category', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'You Are Not Login';
      res.json(response);
      return;
    }

    let obj = req.body;
    site.security.getUser(
      {
        id: req.session.user.id,
      },
      (err, doc) => {
        if (!err && doc) {
          let foundId = doc.followCategoryList.some((_f) => _f === obj.id);

          if (obj.follow && !foundId) {
            doc.followCategoryList.push(obj.id);
          } else if (!obj.follow && foundId) {
            doc.followCategoryList.splice(
              doc.followCategoryList.findIndex((c) => c == obj.id),
              1
            );
          }

          site.security.updateUser(doc, (err) => {
            if (!err) {
              response.done = true;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        } else {
          response.error = err.message;
          res.json(response);
        }
      }
    );
  });

  site.post('/api/manage_user/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'You Are Not Login';
      res.json(response);
      return;
    }

    site.security.getUser(
      {
        id: req.body.id,
      },
      (err, doc) => {
        if (!err) {
          response.done = true;
          let user = { ...doc };
          if (!req.body.all) {
            delete user.password;
          }
          response.doc = user;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/manage_user/update_personal_info', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
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
          let _user = { ...user };
          if (type === 'email') {
            if (req.body.user.newEmail) {
              if (site.feature('souq')) {
                _user.email = req.body.user.newEmail;
              } else {
                if (!req.body.user.newEmail.contains('@') && !req.body.user.newEmail.contains('.')) {
                  _user.email = req.body.user.newEmail + '@' + site.get_company(req).host;
                } else {
                  if (req.body.user.newEmail.contains('@') && !req.body.user.newEmail.contains('.')) {
                    response.error = 'Email must be typed correctly';
                    res.json(response);
                    return;
                  } else if (!req.body.user.newEmail.contains('@') && req.body.user.newEmail.contains('.')) {
                    response.error = 'Email must be typed correctly';
                    res.json(response);
                    return;
                  }
                }
              }
            } else {
              response.error = 'Email Not Set';
              res.json(response);
              return;
            }
          } else if (type === 'password') {
            if (req.body.user.currentPassword !== _user.password) {
              response.error = 'Current Password Error';
              res.json(response);
              return;
            } else if (req.body.user.rePassword !== req.body.user.newPassword) {
              response.error = 'Password does not match';
              res.json(response);
              return;
            } else {
              _user.password = req.body.user.newPassword;
            }
          } else if (type === 'firstName' || type === 'name' || type === 'cover' || type === 'logo' || type === 'birthDate' || type === 'gender' || type === 'name' || type === 'about_me') {
            _user.profile = req.body.user.profile;
          } else if (type === 'mobile') {
            _user.mobile = req.body.user.mobile;
            _user.hideMobile = req.body.user.hideMobile;
            _user.mobileList = req.body.user.mobileList;
          }

          site.security.isUserExists(_user, function (err, user_found) {
            if (user_found && type === 'email') {
              response.error = 'User Is Exist';
              res.json(response);
              return;
            }
            site.security.updateUser(_user, (err1, userDoc) => {
              response.done = true;
              if (!err1 && userDoc) {
                response.doc = userDoc.doc;
                response.doc.company = site.get_company(req);
                response.doc.branch = site.get_branch(req);
                res.json(response);
              } else {
                response.error = 'Email is wrong';
                res.json(response);
              }
            });
          });
        } else {
          response.error = err ? err.message : 'no doc';
        }
      }
    );
  });

  site.post('/api/manage_user/forget_password', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    site.security.getUser(
      {
        email: req.body.email,
      },
      (err, user) => {
        if (!err && user) {
          let where = {
            email: req.body.email,
            code: req.body.code,
            type: req.body.type,
          };
          site.getCheckMailer(where, (callBack) => {
            if (callBack) {
              user.password = req.body.newPassword;
              response.error = 'Code Is Not Correct';
              res.json(response);
              return;
            }
            site.security.updateUser(user, (err, userDoc) => {
              response.done = true;
              response.doc = userDoc.doc;
              response.doc.company = site.get_company(req);
              response.doc.branch = site.get_branch(req);
              res.json(response);
            });
          });
        } else {
          response.error = err ? err.message : 'no doc';
        }
      }
    );
  });
};
