module.exports = function init(site) {
  // site.get({
  //   name: 'manageUsers',
  //   path: __dirname + '/site_files/html/index.html',
  //   parser: 'html',
  //   compress: false,
  // });

  site.get(
    {
      name: 'manageUsers',
    },
    (req, res) => {
      let name = '##word.manageUsers##';
      if(req.urlParser.query ) {
        if(req.urlParser.query.type == 1) {
          name = '##word.writers##';
        } else if(req.urlParser.query.type == 2) {
          name = '##word.editors##';
        } if(req.urlParser.query.type == 3) {
          name = '##word.references##';
        } if(req.urlParser.query.type == 4) {
          name = '##word.photo_references##';
        } if(req.urlParser.query.type == 5) {
          name = '##word.publishers##';
        } 
      }
      let setting = site.getSiteSetting(site.getHostFilter(req.host));
      res.render('manageUsers' + '/index.html', { title: 'manageUsers', appName: name, setting: setting }, { parser: 'html', compres: true });
    }
  );

  site.get({
    name: '/images',
    path: __dirname + '/site_files/images',
  });

  site.post({
    name: '/api/gender/all',
    path: __dirname + '/site_files/json/gender.json',
  });

  site.post({
    name: '/api/usersTypes/all',
    path: __dirname + '/site_files/json/usersTypes.json',
  });

  site.post('/api/manageUsers/add', (req, res) => {

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

    site.security.addUser(user, (err, _id) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });

  });

  site.post('/api/manageUsers/view', (req, res) => {
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


  site.post('/api/manageUsers/update', (req, res) => {
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
          } else if (type === 'name' || type === 'logo' || type === 'birthDate' || type === 'gender' || type === 'name' || type === 'phone' || type === 'mobile') {
            _user.profile = req.body.user.profile;
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

  site.post('/api/manageUsers/forget_password', (req, res) => {
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

  site.post('/api/use/all', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'You Are Not Login';
      res.json(response);
      return;
    }

    let where = req.body.where || {};

    if (where['search']) {
      where.$or = [];

      where.$or.push({
        'gender.ar': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'gender.en': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'type.ar': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'type.en': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'profile.name': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        'profile.lastName': site.get_RegExp(where['search'], 'i'),
      });

      where.$or.push({
        email: site.get_RegExp(where['search'], 'i'),
      });

      delete where['search'];
    }
    where['id'] = { $ne: 1 };
    where['type'] = 2;

    site.security.getUsers(
      {
        where: where,
        limit: 1000,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;

          response.users = docs;
          response.count = count;
        }
        res.json(response);
      }
    );
  });

};
