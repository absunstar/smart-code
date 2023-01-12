module.exports = function init(site) {
  site.get({
    name: 'manage_users',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: false,
  });

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post({
    name: '/api/users_types/all',
    path: __dirname + '/site_files/json/users_types.json',
  });

  site.post('/api/manage_users/add', (req, res) => {
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
    user.feedback_list = [];
    user.followers_list = [];
    user.follow_category_list = [];

    user.notific_setting = {
      instant_alerts: true,
      ads_members_follow: true,
      ads_sections_followed: true,
      ads_searches_followed: true,
      replies_ads_followed: true,
      comments_my_ads: true,
      private_messages: true,
    };
    user.profile.files = [];
    user.profile.other_addresses_list = [];

    if (user.roles.length < 1) {
      if (user.type.id == 2 || user.type.id == 3) {
        user.roles = [
          {
            module_name: 'public',
            name: 'shipping_order_admin',
            en: 'Shipping Order Admin',
            ar: 'شحن الطلبات',
          },
        ];
      }
    }

    site.security.addUser(user, (err, _id) => {
      if (!err) {
        response.done = true;
      } else {
        console.log(err);
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/manage_users/view', (req, res) => {
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
          delete user.password;
          response.doc = user;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });

  site.post('/api/manage_users/update', (req, res) => {
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
            } else {
              response.error = 'Email Not Set';
              res.json(response);
              return;
            }
          } else if (type === 'password') {
            if (req.body.user.current_password !== _user.password) {
              response.error = 'Current Password Error';
              res.json(response);
              return;
            } else if (req.body.user.re_password !== req.body.user.new_password) {
              response.error = 'Password does not match';
              res.json(response);
              return;
            } else {
              _user.password = req.body.user.new_password;
            }
          } else if (type === 'name' || type === 'logo' || type === 'birth_date' || type === 'gender' || type === 'name' || type === 'phone' || type === 'mobile') {
            _user.profile = req.body.user.profile;
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

  site.post('/api/manage_users/forget_password', (req, res) => {
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
};
