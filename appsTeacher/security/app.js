module.exports = function init(site) {
  site.post("/api/security/permissions", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    response.done = true;
    response.permissions = site.security.permissions;
    res.json(response);
  });

  site.post("/api/security/roles", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    response.done = true;
    response.roles = site.security.roles;

    res.json(response);
  });

  site.get({
    name: "security",
    path: __dirname + "/site_files/html/index.html",
    parser: "html js",
    compress: false,
  });

  site.get(
    {
      name: "security/users",
    },
    (req, res) => {
      res.render(
        "security" + "/users.html",
        {
          title: "security/users",
          appName: req.word("Users"),
          setting: site.getSiteSetting(req.host),
        },
        { parser: "html", compres: true }
      );
    }
  );
  // site.get({
  //   name: "security/users",
  //   path: __dirname + "/site_files/html/users.html",
  //   parser: "html js",
  //   compress: false,
  // });

  site.get({
    name: "security/roles",
    path: __dirname + "/site_files/html/roles.html",
    parser: "html js",
    compress: false,
  });

  site.get({
    name: "/images",
    path: __dirname + "/site_files/images",
  });

  site.post("/api/users/all", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let where = req.body.where || {};
    let search = req.body.search || "";

    if (search) {
      where.$or = [];

      where.$or.push({
        firstName: site.get_RegExp(where["search"], "i"),
      });

      where.$or.push({
        lastName: site.get_RegExp(where["search"], "i"),
      });

      where.$or.push({
        mobile: site.get_RegExp(where["search"], "i"),
      });

      delete where["search"];
    }
    // where["id"] = { $ne: 1 };
    where["type"] = { $ne: "student" };
    // where.$and = [
    //   {
    //     type: { $ne: "student" },
    //   },
    //   {
    //     type: { $ne: "teacher" },
    //   },
    //   {
    //     type: { $ne: "parent" },
    //   },
    // ];

    where["host"] = site.getHostFilter(req.host);

    site.security.getUsers(
      {
        where: where,
        limit: 1000,
      },
      (err, docs, count) => {
        if (!err) {
          response.done = true;

          for (let i = 0; i < docs.length; i++) {
            let u = docs[i];
            u.image = u.image || "/images/user.png";
          }

          response.users = docs;
          response.count = count;
        }
        res.json(response);
      }
    );
  });

  site.post("/api/user/add", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let user = req.body;
    user.$req = req;
    user.$res = res;
    user.host = site.getHostFilter(req.host);

    site.security.addUser(user, (err, _id) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/user/update", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let user = req.body;
    user.$req = req;
    user.$res = res;
    delete user.$$hashKey;
    site.security.updateUser(user, (err) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/user/delete", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let id = req.body.id;
    if (id) {
      site.security.deleteUser(
        {
          id: id,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err) {
            response.done = true;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    } else {
      response.error = "No ID Requested";
      res.json(response);
    }
  });

  site.post("/api/user/view", (req, res) => {
    let response = {
      done: false,
    };

    let setting = site.getSiteSetting(req.host);


    // if (!req.session.user) {
    //   response.error = 'You Are Not Login';
    //   res.json(response);
    //   return;
    // }
    let where = {};
    if (req.body.id) {
      where = {
        id: req.body.id,
      };
    } else if (req.body._id) {
      where = {
        _id: req.body._id,
      };
    }

    site.security.getUser(where, (err, doc) => {
      if (!err && doc) {
        response.done = true;

        if (doc.createdDate) {
          doc.$createdDate = site.xtime(doc.createdDate, req.session.lang);
        }
        let date = site.getDate(doc.visit_date);
        date.setMinutes(date.getMinutes() + 1);
        if (site.getDate() < date) {
          doc.$isOnline = true;
        } else {
          doc.$isOnline = false;
          if (doc.visitDate) {
            doc.$lastSeen = site.xtime(doc.visitDate, req.session.lang);
          }
        }
        if (req.body.type == "notifications") {
          doc.notificationsList = doc.notificationsList || [];
          for (let i = 0; i < doc.notificationsList.length; i++) {
            doc.notificationsList[i].$time = site.xtime(doc.notificationsList[i].date, req.session.lang);
          }
        }

        if (setting.linkWithHost) {
          if (doc.email.like("*@" + req.host)) {
            let newHost = '@' + req.host
            doc.email = doc.email.replace(newHost, "");
          }
        }
        
        response.doc = doc;
      } else if (err) {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/user/register", (req, res) => {
    let response = {};

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = site.fromBase64(req.body.email);
        req.body.password = site.fromBase64(req.body.password);
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email);
        req.body.password = site.from123(req.body.password);
      }
    }

    site.security.register(
      {
        email: req.body.email,
        password: req.body.password,
        ip: req.ip,
        permissions: ["user"],
        files: [],
        name: req.body.email,
        $req: req,
        $res: res,
      },
      function (err, doc) {
        if (!err) {
          response.user = doc;
          response.done = true;
        } else {
          response.error = err.message;
        }
        res.json(response);
      }
    );
  });
  site.post({ name: "/api/user/login", public: true }, function (req, res) {
    let response = {
      accessToken: req.session.accessToken,
    };
    let setting = site.getSiteSetting(req.host);

    if (req.body.$encript) {
      if (req.body.$encript === "64") {
        req.body.email = site.fromBase64(req.body.email);
        req.body.password = site.fromBase64(req.body.password);
      } else if (req.body.$encript === "123") {
        req.body.email = site.from123(req.body.email);
        req.body.password = site.from123(req.body.password);
      }
    }

    if (site.security.isUserLogin(req, res)) {
      response.error = "Login Error , You Are Loged";
      res.json(response);
      return;
    }

    if (setting.linkWithHost) {
      if (!req.body.email.like("*@" + req.host)) {
        req.body.email = req.body.email + "@" + req.host;
      }
    }    

    site.security.getUser(
      {
        email: req.body.email,
      },
      (err, doc) => {
        if (!err) {
          let _user = { ...doc };

          if (_user.active == false) {
            response.error = "The account is inactive";
            res.json(response);
            return;
          }
          if(!_user.email || !_user.password) {
            response.error = "The account is not found";
            res.json(response);
            return;
          }

          site.security.login(
            {
              email: _user.email,
              password: req.body.password,
              $req: req,
              $res: res,
            },
            function (err, user) {
              if (!err) {
                req.session.user_id = user.id;
                req.session.user = user;
                req.session.$save();

                response.user = user;

                response.done = true;
              } else {
                response.error = err.message;
              }

              res.json(response);
            }
          );
        } else {
          response.error = err.message;
        }
      }
    );
  });

  site.post("/api/user/logout", function (req, res) {
    let response = {
      done: true,
    };

    site.security.logout(req, res, (err, ok) => {
      response.accessToken = req.session.accessToken;
      if (ok) {
        response.done = true;
        res.json(response);
      } else {
        response.error = "You Are Not Loged";
        response.done = true;
        res.json(response);
      }
    });
  });

  site.post("/api/role/add", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let role = req.body;
    role.$req = req;
    role.$res = res;
    site.security.addRole(role, (err, doc) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/role/edit", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let role = req.body;
    role.$req = req;
    role.$res = res;
    site.security.updateRole(role, (err) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/role/delete", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let role = req.data;
    role.$req = req;
    role.$res = res;

    site.security.deleteRole(role, (err, doc) => {
      if (!err) {
        response.done = true;
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post("/api/get_dir_names", (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = "You Are Not Login";
      res.json(response);
      return;
    }

    let z = req.body;
    let w = [];

    site.words.list.forEach((x) => {
      z.forEach((xx) => {
        if (xx.name && xx.name.replace(/-/g, "_") == x.name) {
          w.push(x);
        }
      });
    });

    response.doc = w;

    res.json(response);
  });
};
