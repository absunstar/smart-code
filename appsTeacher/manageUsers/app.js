module.exports = function init(site) {
  let app = {
    name: "manageUsers",
    allowMemory: false,
    memoryList: [],
    newList: [],
    activeList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
    allowRouteAdd: true,
    allowRouteUpdate: true,
    allowRouteDelete: true,
    allowRouteView: true,
    allowRouteAll: true,
  };

  app.$collection = site.connectCollection("users_info");

  app.init = function () {
    app.$collection.findMany({ sort: { id: -1 } }, (err, docs) => {
      if (!err) {
        docs.forEach((doc) => {
          if (doc.active && doc.roles && doc.roles[0].name == "teacher") {
            let obj = {
              id: doc.id,
              image: doc.image,
              firstName: doc.firstName,
              lastName: doc.lastName,
            };
            app.newList.push({ ...obj });
            app.activeList.push({
              ...obj,
              specialty: doc.specialties ? doc.specialties[0] : {},
            });
          }
        });
      }
    });
  };
  app.add = function (_item, callback) {
    app.$collection.add(_item, (err, doc) => {
      if (callback) {
        callback(err, doc);
      }
      if (app.allowMemory && !err && doc) {
        app.memoryList.push(doc);
      }
    });
  };
  app.update = function (_item, callback) {
    app.$collection.edit(
      {
        where: {
          id: _item.id,
        },
        set: _item,
      },
      (err, result) => {
        if (callback) {
          callback(err, result);
        }
        if (app.allowMemory && !err && result) {
          let index = app.memoryList.findIndex((itm) => itm.id === result.doc.id);
          if (index !== -1) {
            app.memoryList[index] = result.doc;
          } else {
            app.memoryList.push(result.doc);
          }
        } else if (app.allowCache && !err && result) {
          let index = app.cacheList.findIndex((itm) => itm.id === result.doc.id);
          if (index !== -1) {
            app.cacheList[index] = result.doc;
          } else {
            app.cacheList.push(result.doc);
          }
        }
      }
    );
  };
  app.delete = function (_item, callback) {
    app.$collection.delete(
      {
        id: _item.id,
      },
      (err, result) => {
        if (callback) {
          callback(err, result);
        }
        if (app.allowMemory && !err && result.count === 1) {
          let index = app.memoryList.findIndex((a) => a.id === _item.id);
          if (index !== -1) {
            app.memoryList.splice(index, 1);
          }
        } else if (app.allowCache && !err && result.count === 1) {
          let index = app.cacheList.findIndex((a) => a.id === _item.id);
          if (index !== -1) {
            app.cacheList.splice(index, 1);
          }
        }
      }
    );
  };
  app.view = function (_item, callback) {
    if (callback) {
      if (app.allowMemory) {
        if ((item = app.memoryList.find((itm) => itm.id == _item.id))) {
          callback(null, item);
          return;
        }
      } else if (app.allowCache) {
        if ((item = app.cacheList.find((itm) => itm.id == _item.id))) {
          callback(null, item);
          return;
        }
      }

      app.$collection.find({ id: _item.id }, (err, doc) => {
        callback(err, doc);

        if (!err && doc) {
          if (app.allowMemory) {
            app.memoryList.push(doc);
          } else if (app.allowCache) {
            app.cacheList.push(doc);
          }
        }
      });
    }
  };
  app.all = function (_options, callback) {
    if (callback) {
      if (app.allowMemory) {
        callback(null, app.memoryList);
      } else {
        app.$collection.findMany(_options, callback);
      }
    }
  };

  if (app.allowRoute) {
    if (app.allowRouteGet) {
      site.get(
        {
          name: app.name,
        },
        (req, res) => {
          res.render(
            app.name + "/index.html",
            {
              title: app.name,
              appName: req.word("Manage Users"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ["login"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let setting = site.getSiteSetting(req.host);
        let _data = req.data;
        if (_data.type == "teacher") {
          _data.roles = [{ name: "teacher" }];
          _data.permissions = [{ name: "teacher" }];
        } else if (_data.type == "student") {
          _data.roles = [{ name: "student" }];
          _data.permissions = [{ name: "student" }];
        }

        _data.host = site.getHostFilter(req.host);

        app.add(_data, (err, doc) => {
          if (!err && doc) {
            if (!setting.isShared) {
              site.addNewHost({ domain: doc.userName, filter: doc.userName });
            }
            response.done = true;
            response.doc = doc;
          } else {
            response.error = err.mesage;
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteUpdate) {
      site.post(
        {
          name: `/api/${app.name}/update`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          _data.editUserInfo = req.getUserFinger();

          site.security.updateUser(_data, (err, result) => {
            if (!err) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      );

      site.post(
        {
          name: `/api/${app.name}/updateStudentNotifications`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          site.security.getUser({ id: req.session.user.id }, (err, user) => {
            if (!err) {
              if (user) {
                user.notificationsList = user.notificationsList || [];

                if (_data.type == "deleteAll") {
                  user.notificationsList = [];
                } else if (_data.type == "deleteOne") {
                  user.notificationsList = user.notificationsList.filter((_n) => _n.id != _data.id);
                } else if (_data.type == "showAll") {
                  for (let i = 0; i < user.notificationsList.length; i++) {
                    user.notificationsList[i].show = true;
                  }
                }
                site.security.updateUser(user, (err1, result) => {
                  if (!err1) {
                    response.done = true;
                    result.doc.notificationsList = result.doc.notificationsList || [];
                    for (let i = 0; i < result.doc.notificationsList.length; i++) {
                      result.doc.notificationsList[i].$time = site.xtime(result.doc.notificationsList[i].date, req.session.lang);
                    }
                    response.result = result.doc;
                  } else {
                    response.error = err1.message;
                  }
                  res.json(response);
                });
              } else {
                res.json(response);
              }
            } else {
              res.json(response);
            }
          });
        }
      );
    }

    if (app.allowRouteDelete) {
      site.post(
        {
          name: `/api/${app.name}/delete`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;
          site.security.deleteUser({ id: _data.id, $req: req, $res: res }, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
              res.json(response);
            } else {
              response.error = err?.message || "Deleted Not Exists";
              res.json(response);
            }
          });
        }
      );
    }

    if (app.allowRouteView) {
      site.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        security.getUser({ id: _data.id }, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            response.doc = doc;
          } else {
            response.error = err?.message || "Not Exists";
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
        let setting = site.getSiteSetting(req.host);
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 50;
        let select = req.body.select || {
          id: 1,
          image: 1,
          userId: 1,
          type: 1,
          active: 1,
          userName: 1,
          firstName: 1,
          email: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            firstName: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            lastName: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            idNumber: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            "center.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gender.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gender.nameEn": site.get_RegExp(search, "i"),
          });

          where.$or.push({
            phone: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            mobile: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            whatsapp: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            socialEmail: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            address: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gov.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "city.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "area.name": site.get_RegExp(search, "i"),
          });
        }
        if (where["type"] != "teacher") {
          if ((teacherId = site.getTeacherSetting(req))) {
            where["teacherId"] = teacherId;
          } else {
            where["host"] = site.getHostFilter(req.host);
          }
        } else if (setting.isShared) {
          where["host"] = site.getHostFilter(req.host);
        }
        where["id"] = { $ne: 1 };
        app.$collection.findMany({ where, select }, (err, users, count) => {
          res.json({
            done: true,
            count: count,
            list: users,
          });
        });
      });
    }
  }

  site.addNotificationToStudents = function (doc, req) {
    let where = {};
    if (doc.type.name == "parent") {
      where["type"] = "parent";
    } else {
      where["type"] = "student";

      if (doc.type.name == "online") {
        where["placeType"] = "online";
      } else if (doc.type.name == "offline") {
        where["placeType"] = "offline";
        if (doc.center.id) {
          where["center.id"] = doc.center.id;
        }
      } else if (doc.type.name == "specificStudents") {
        let studentsIds = doc.studentsList.map((_s) => _s.id);
        where["id"] = { $in: studentsIds };
      }

      if (doc.educationalLevel.id) {
        where["educationalLevel.id"] = doc.educationalLevel.id;
      }
      if (doc.schoolYear.id) {
        where["schoolYear.id"] = doc.schoolYear.id;
      }
    }

    if ((teacherId = site.getTeacherSetting(req))) {
      where["teacherId"] = teacherId;
    } else {
      where["host"] = site.getHostFilter(req.host);
    }

    site.security.getUsers(where, (err, docs) => {
      if (!err && docs) {
        for (let i = 0; i < docs.length; i++) {
          docs[i].notificationsList = docs[i].notificationsList || [];
          docs[i].notificationsList.unshift({ id: doc.id, show: false, date: doc.date, image: doc.image, title: doc.title, content: doc.content });
          site.security.updateUser(docs[i]);
        }
      }
    });
  };

  site.getTeachers = function (req, callBack) {
    callBack = callBack || function () {};
    let select = req.body.select || {
      id: 1,
      firstName: 1,
      image: 1,
      title: 1,
      bio: 1,
    };
    let where = {};
    where["active"] = true;
    where["host"] = site.getHostFilter(req.host);
    where["type"] = "teacher";
    app.$collection.findMany({ where, select }, (err, docs) => {
      callBack(err, docs);
    });
    // }
  };

  app.init();
  site.addApp(app);
};
