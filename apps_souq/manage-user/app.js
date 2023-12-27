module.exports = function init(site) {
  site.get(
    {
      name: 'manage_user',
    },
    (req, res) => {
      if (req.session.user) {
        site.security.getUser({ id: req.session.user.id }, (err, doc) => {
          if (!err && doc) {
            doc.title = site.setting.title + ' | ' + doc.profile.name;
            doc.image_url = doc.profile.image_url;
            doc.description = doc.profile.about_meabout_me;
            res.render('manage-user/index.html', doc, {
              parser: 'html css js',
              compress: true,
            });
          }
        });
      }
    }
  );

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });
  site.get('/api/user/update-visit-date', (req, res) => {
    if(req.session.user){
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
          let foundId = doc.follow_category_list.some((_f) => _f === obj.id);

          if (obj.follow && !foundId) {
            doc.follow_category_list.push(obj.id);
          } else if (!obj.follow && foundId) {
            doc.follow_category_list.splice(
              doc.follow_category_list.findIndex((c) => c == obj.id),
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
            if (req.body.user.new_email) {
              if (site.feature('souq') ||req.body.user.$souq ) {
                _user.email = req.body.user.new_email;
              } else {
                if (!req.body.user.new_email.contains('@') && !req.body.user.new_email.contains('.')) {
                  _user.email = req.body.user.new_email + '@' + site.get_company(req).host;
                } else {
                  if (req.body.user.new_email.contains('@') && !req.body.user.new_email.contains('.')) {
                    response.error = 'Email must be typed correctly';
                    res.json(response);
                    return;
                  } else if (!req.body.user.new_email.contains('@') && req.body.user.new_email.contains('.')) {
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
            if (!req.body.user.$current_password ||req.body.user.$current_password !== _user.password) {
              response.error = 'Current Password Error';
              res.json(response);
              return;
            } else if (!req.body.user.$re_password || req.body.user.$re_password !== req.body.user.$new_password) {
              response.error = 'Password does not match';
              res.json(response);
              return;
            } else {
              _user.password = req.body.user.$new_password;
            }
          } else if (type === 'first_name' || type === 'name' || type === 'cover' || type === 'logo' || type === 'address' || type === 'birth_date' || type === 'name' || type === 'about_me') {
            _user.profile = req.body.user.profile;
          } else if (type === 'mobile') {
            _user.mobile = req.body.user.mobile;
            _user.hide_mobile = req.body.user.hide_mobile;
            _user.mobile_list = req.body.user.mobile_list;
          } else if(type === 'gender') {
            _user.gender = req.body.user.gender;
          } else if (type === 'notific_setting') {
            _user.notific_setting = req.body.user.notific_setting;
          }

          site.security.isUserExists(_user, function (err, user_found) {
            if (user_found && type === 'email') {
              response.error = 'User Is Exist';
              res.json(response);
              return;
            }
            site.security.updateUser(_user, (err1, user_doc) => {
              response.done = true;
              if (!err1 && user_doc) {
                response.doc = user_doc.doc;
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
              user.password = req.body.new_password;
              response.error = 'Code Is Not Correct';
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
          response.error = err ? err.message : 'no doc';
        }
      }
    );
  });

  site.post('/api/user/update_cart', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'You Are Not Login';
      res.json(response);
      return;
    }

    let user = req.body;

    user.$req = req;
    user.$res = res;
    delete user.$$hashKey;
    site.security.getUser(
      {
        email: user.email,
      },
      (err, userDoc) => {
        if (!err && userDoc) {
          userDoc.cart = user.cart;
          site.security.updateUser(userDoc, (err) => {
            if (!err) {
              response.done = true;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
};