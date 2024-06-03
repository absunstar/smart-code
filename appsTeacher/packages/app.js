module.exports = function init(site) {
  let app = {
    name: "packages",
    allowMemory: false,
    memoryList: [],
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
  site.packagesList = site.packagesList || [];

  app.$collection = site.connectCollection(app.name);

  app.init = function () {
    if (app.allowMemory) {
      app.$collection.findMany({}, (err, docs) => {
        if (!err) {
          if (docs.length == 0) {
            app.cacheList.forEach((_item, i) => {
              app.$collection.add(_item, (err, doc) => {
                if (!err && doc) {
                  app.memoryList.push(doc);
                }
              });
            });
          } else {
            docs.forEach((doc) => {
              app.memoryList.push(doc);
            });
          }
        }
      });
    }
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
      let where = {};
      if(_item._id) {
        where._id = _item._id
      } else {
        where.id = _item.id
      }

      app.$collection.find(where, (err, doc) => {
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
              appName: req.word("Packages"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );

      site.get(
        {
          name: "packageView",
        },
        (req, res) => {
          let notificationsCount = 0;
          if (req.session.user && req.session.user.notificationsList) {
            let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
            notificationsCount = notifications.length;
          }
          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            notificationsCount: notificationsCount,
            notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
            setting: setting,
            guid: "",
            setting: setting,
            filter: site.getHostFilter(req.host),
            site_logo: setting.logo?.url || "/images/logo.png",
            page_image: setting.logo?.url || "/images/logo.png",
            user_image: req.session?.user?.image?.url || "/images/logo.png",
            site_name: setting.siteName,
            page_lang: setting.id,
            page_type: "website",
            page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
            page_description: setting.description.substr(0, 200),
            page_keywords: setting.keyWordsList.join(","),
          };
          if (req.hasFeature("host.com")) {
            data.site_logo = "https://" + req.host + data.site_logo;
            data.page_image = "https://" + req.host + data.page_image;
            data.user_image = "https://" + req.host + data.user_image;
          }
          res.render(app.name + "/packageView.html", data, {
            parser: "html",
            compres: true,
          });
        }
      );

      site.get(
        {
          name: "packagesView",
        },
        (req, res) => {
          let notificationsCount = 0;
          if (req.session.user && req.session.user.notificationsList) {
            let notifications = req.session.user.notificationsList.filter((_n) => !_n.show);
            notificationsCount = notifications.length;
          }
          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            notificationsCount: notificationsCount,
            notificationsList: req.session?.user?.notificationsList?.slice(0, 7),
            setting: setting,
            guid: "",
            setting: setting,
            filter: site.getHostFilter(req.host),
            site_logo: setting.logo?.url || "/images/logo.png",
            page_image: setting.logo?.url || "/images/logo.png",
            user_image: req.session?.user?.image?.url || "/images/logo.png",
            site_name: setting.siteName,
            page_lang: setting.id,
            page_type: "website",
            page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
            page_description: setting.description.substr(0, 200),
            page_keywords: setting.keyWordsList.join(","),
          };
          if (req.hasFeature("host.com")) {
            data.site_logo = "https://" + req.host + data.site_logo;
            data.page_image = "https://" + req.host + data.page_image;
            data.user_image = "https://" + req.host + data.user_image;
          }
          res.render(app.name + "/packagesView.html", data, {
            parser: "html",
            compres: true,
          });
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ["login"] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        _data.date = new Date();
        _data.addUserInfo = req.getUserFinger();
        _data.host = site.getHostFilter(req.host);
        app.add(_data, (err, doc) => {
          if (!err && doc) {
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

          app.update(_data, (err, result) => {
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

          app.delete(_data, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err?.message || "Deleted Not Exists";
            }
            res.json(response);
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
        app.view(_data, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            if (req.session.user && req.session.user.packagesList && req.session.user.packagesList.some((s) => s.toString() == doc._id.toString())) {
              doc.$buy = true;
            }
            doc.$time = site.xtime(doc.date, req.session.lang || "ar");
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
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 50;
        let select = req.body.select || {
          id: 1,
          name: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          date: 1,
          active: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            name: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            description: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "educationalLevel.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "schoolYear.name": site.get_RegExp(search, "i"),
          });
        }

        if (req.body.type == "toStudent") {
          if (req.session.user && req.session.user.type == "student") {
            where["educationalLevel.id"] = req.session.user?.educationalLevel?.id;
            where["schoolYear.id"] = req.session.user?.schoolYear?.id;
            where.$and = [
              {
                $or: [{ placeType: req.session.user.placeType }, { placeType: "both" }],
              },
              {
                $or: [
                  {
                    name: site.get_RegExp(search, "i"),
                  },
                  {
                    description: site.get_RegExp(search, "i"),
                  },
                ],
              },
            ];
          }
        } else if (req.body.type == "myStudent") {
          if (req.session.user && req.session.user.type == "student" && req.session.user.packagesList) {
            let idList = req.session.user.packagesList.map((_item) => _item);
            where["_id"] = {
              $in: idList,
            };
          }
        }

        where["host"] = site.getHostFilter(req.host);
        app.all({ where, select, limit }, (err, docs) => {
          if (req.body.type) {
            for (let i = 0; i < docs.length; i++) {
              docs[i].$time = site.xtime(docs[i].date, req.session.lang || "ar");
            }
          }
          res.json({
            done: true,
            list: docs,
          });
        });
      });
    }
  }

  site.post({ name: `/api/${app.name}/buyCode`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;
    app.view({ id: _data.packageId }, (err, doc) => {
      if (!err && doc) {
        site.validateCode({ code: _data.code, price: _data.packagePrice }, (errCode, code) => {
          if (errCode) {
            response.error = errCode;
            res.json(response);
            return;
          } else {
            site.security.getUser(
              {
                id: req.session.user.id,
              },
              (err, user) => {
                if (!err && user) {
                  user.packagesList = user.packagesList || [];
                  user.lecturesList = user.lecturesList || [];
                  doc.lecturesList.forEach((_l) => {
                    if (!user.lecturesList.some((l) => l.id == _l.lecture._id)) {
                      user.lecturesList.push({
                      lectureId: site.mongodb.ObjectID(_l.lecture._id),
                      });
                    }
                  });
                  user.packagesList.push(doc._id);
                  site.addPurchaseOrder({
                    type: "package",
                    target: { id: doc._id, name: doc.name },
                    code: _data.code,
                    price: doc.price,
                    date: new Date(),
                    host: site.getHostFilter(req.host),
                    user: {
                      id: user.id,
                      firstName: user.firstName,
                      userName: user.userName,
                    },
                  });
                  site.security.updateUser(user);
                }
                response.done = true;
                doc.$buy = true;
                doc.$time = site.xtime(doc.date, req.session.lang || "ar");
                response.doc = doc;
                res.json(response);
              }
            );
          }
        });
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });

  site.getPackages = function (req, callBack) {
    callBack = callBack || function () {};
    site.packagesList = [];

    let limit = req.body.limit || 7;
    let select = req.body.select || {
      id: 1,
      name: 1,
      image: 1,
      description : 1,
      price : 1,
      totalLecturesPrice : 1,
      date: 1,
    };

    // let packages = [];
    // if (req.session.user && req.session.user.type == "student") {
    //   packages = site.packagesList.filter(
    //     (a) =>
    //       a.host == site.getHostFilter(req.host) &&
    //       (a.placeType == req.session.user.placeType ||
    //         a.placeType == "both") &&
    //       a.schoolYear.id == req.session.user.schoolYear.id &&
    //       a.educationalLevel.id == req.session.user.educationalLevel.id
    //   );
    // } else {
    //   packages = site.packagesList.filter(
    //     (a) => a.host == site.getHostFilter(req.host)
    //   );
    // }
    // if (packages.length > 0) {
    //   callBack(null, packages);
    // } else {
    let where = {};
    if (req.session.user && req.session.user.type == "student") {
      where["educationalLevel.id"] = req.session.user.educationalLevel.id;
      where["schoolYear.id"] = req.session.user.schoolYear.id;
      where["host"] = site.getHostFilter(req.host);
      where["active"] = true;
      where.$or = [{ placeType: req.session.user.placeType }, { placeType: "both" }];
    }
    app.$collection.findMany({ where, select, limit }, (err, docs) => {
      if (!err && docs) {
        for (let i = 0; i < docs.length; i++) {
          let doc = docs[i];
          if (!site.packagesList.some((k) => k.id === doc.id)) {
            doc.time = site.xtime(doc.date, "Ar");

            site.packagesList.push(doc);
          }
        }
      }
      callBack(err, docs);
    });
    // }
  };

  app.init();
  site.addApp(app);
};
