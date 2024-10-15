module.exports = function init(site) {
  let app = {
    name: "books",
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
  site.bookList = [];

  app.$collection = site.connectCollection(app.name);

  app.init = function () {
    app.$collection.findMany({sort:{id:-1}}, (err, docs) => {
      if (!err) {
        docs.forEach((doc) => {
          site.bookList.push({
            _id: doc._id,
            id: doc.id,
            code: doc.code,
            name: doc.name,
            educationalLevel: doc.educationalLevel,
            schoolYear: doc.schoolYear,
            subject: doc.subject,
            description: doc.description,
            date: doc.date,
            host: doc.host,
            teacherId: doc.teacherId,
            price: doc.price,
            image: doc.image,
            active: doc.active,
          });
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

      let where = {};
      if (_item._id) {
        where._id = _item._id;
      } else {
        where.id = _item.id;
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
              appName: req.word("Books"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );

      site.get(
        {
          name: "bookView",
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
            isTeacher: req.session.selectedTeacherId ? true : false,
            filter: site.getHostFilter(req.host),
            site_logo: setting.logo?.url || "/images/logo.png",
            site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
            page_image: setting.logo?.url || "/images/logo.png",
            user_image: req.session?.user?.image?.url || "/images/logo.png",
            powerdByLogo: setting.powerdByLogo?.url || "/images/logo.png",
            site_name: setting.siteName,
            page_lang: setting.id,
            page_type: "website",
            page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
            page_description: setting.description.substr(0, 200),
            page_keywords: setting.keyWordsList.join(","),
          };
          if (req.hasFeature("host.com")) {
            data.site_logo = "//" + req.host + data.site_logo;
            data.site_footer_logo = "//" + req.host + data.site_footer_logo;
            data.page_image = "//" + req.host + data.page_image;
            data.user_image = "//" + req.host + data.user_image;
            data.powerdByLogo = "//" + req.host + data.powerdByLogo;
          }
          res.render(app.name + "/bookView.html", data, {
            parser: "html",
            compres: true,
          });
        }
      );

      site.get(
        {
          name: "booksView",
        },
        (req, res) => {
          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
            setting: setting,
            guid: "",
            isTeacher: req.session.selectedTeacherId ? true : false,
            filter: site.getHostFilter(req.host),
            site_logo: setting.logo?.url || "/images/logo.png",
            site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
            page_image: setting.logo?.url || "/images/logo.png",
            powerdByLogo: setting.powerdByLogo?.url || "/images/logo.png",
            user_image: req.session?.user?.image?.url || "/images/logo.png",
            site_name: setting.siteName,
            page_lang: setting.id,
            page_type: "website",
            page_title: setting.siteName + " " + setting.titleSeparator + " " + setting.siteSlogan,
            page_description: setting.description.substr(0, 200),
            page_keywords: setting.keyWordsList.join(","),
          };
          if (req.hasFeature("host.com")) {
            data.site_logo = "//" + req.host + data.site_logo;
            data.site_footer_logo = "//" + req.host + data.site_footer_logo;
            data.page_image = "//" + req.host + data.page_image;
            data.user_image = "//" + req.host + data.user_image;
            data.powerdByLogo = "//" + req.host + data.powerdByLogo;
          }
          res.render(app.name + "/booksView.html", data, {
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
        _data.date = site.getDate();
        _data.addUserInfo = req.getUserFinger();
        _data.host = site.getHostFilter(req.host);
        if ((teacherId = site.getTeacherSetting(req))) {
          _data.teacherId = teacherId;
        } else {
          response.error = "There Is No Teacher";
          res.json(response);
          return;
        }

        app.add(_data, (err, doc) => {
          if (!err && doc) {
            let setting = site.getSiteSetting(req.host);

            if (setting.isShared) {
              doc.code = (req.session?.user?.prefix || req.session?.user?.id.toString()) + "B" + doc.id.toString();
            } else {
              doc.code = (setting.teacher.prefix || req.session?.user?.id.toString()) + "B" + doc.id.toString();
            }

            app.update(doc, (err, result) => {
              if (!err && result) {
                response.done = true;
                response.doc = result.doc;
                site.bookList.unshift({
                  _id: doc._id,
                  id: doc.id,
                  code: result.doc.code,
                  name: doc.name,
                  educationalLevel: doc.educationalLevel,
                  schoolYear: doc.schoolYear,
                  subject: doc.subject,
                  description: doc.description,
                  date: doc.date,
                  host: doc.host,
                  teacherId: doc.teacherId,
                  price: doc.price,
                  active: doc.active,
                  image: doc.image,
                });
              } else {
                response.error = err.mesage;
              }
              res.json(response);
            });
          } else {
            response.error = err.mesage;
            res.json(response);
          }
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
              let index = site.bookList.findIndex((a) => a.id === result?.doc?.id);
              if (index !== -1) {
                site.bookList[index] = {
                  _id: result.doc._id,
                  id: result.doc.id,
                  code: result.doc.code,
                  name: result.doc.name,
                  educationalLevel: result.doc.educationalLevel,
                  schoolYear: result.doc.schoolYear,
                  subject: result.doc.subject,
                  description: result.doc.description,
                  date: result.doc.date,
                  host: result.doc.host,
                  teacherId: result.doc.teacherId,
                  price: result.doc.price,
                  active: result.doc.active,
                  image: result.doc.image,
                };
              }
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
              let index = site.bookList.findIndex((a) => a.id === result?.doc?.id);
              if (index !== -1) {
                site.bookList.splice(index, 1);
              }
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
        site.getPurchaseOrder({ "status.name": "delivered", type: "book", "user.id": req.session?.user?.id }, (err1, order) => {
          app.view(_data, (err, doc) => {
            if (!err && doc) {
              response.done = true;
              if (req.session.user && req.session.user.booksList && req.session.user.booksList.some((s) => s == doc.id)) {
                doc.$buy = true;
              }
              if (order) {
                doc.$delivered = true;
              } else if (doc.price != 0) {
                delete doc.linkList;
                delete doc.fileList;
              }
              response.doc = doc;
            } else {
              response.error = err?.message || "Not Exists";
            }
            res.json(response);
          });
        });
      });
    }

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 20;
        let select = req.body.select || {
          id: 1,
          name: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          code: 1,
          active: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            name: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            code: search,
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
          where.$or.push({
            "subject.name": site.get_RegExp(search, "i"),
          });
        }
        if (req.session?.user?.type == 'student') {
          if (!where.educationalLevel) {
            where.educationalLevel = req.session?.user?.educationalLevel;
          }
          if (!where.schoolYear) {
            where.schoolYear = req.session?.user?.schoolYear;
          }
        }
        if (where['educationalLevel']) {
          where['educationalLevel.id'] = where['educationalLevel'].id;
          delete where['educationalLevel'];
        }

        if (where['schoolYear']) {
          where['schoolYear.id'] = where['schoolYear'].id;
          delete where['schoolYear'];
        }


        if (where['subject']) {
          where['subject.id'] = where['subject'].id;
          delete where['subject'];
        }

        if (req.body.type == "toStudent") {
          if (req.session.user && req.session.user.type == "student") {
            // where["educationalLevel.id"] = req.session.user?.educationalLevel?.id;
            // where["schoolYear.id"] = req.session.user?.schoolYear?.id;
          }
        } else if (req.body.type == "myStudent") {
          if (req.session.user && req.session.user.type == "student") {
            let idList = req.session.user.booksList.map((_item) => _item);
            where["id"] = {
              $in: idList,
            };
          }
        }
        if ((teacherId = site.getTeacherSetting(req))) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }
        
        app.all({ where, select, limit, sort: { id: -1 } }, (err, docs) => {
          if (req.body.type) {
            for (let i = 0; i < docs.length; i++) {}
          }
          res.json({
            done: true,
            list: docs,
          });
        });
      });
    }
  }

  site.post({ name: `/api/${app.name}/buyCode`, require: { permissions: ["login"] } }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;
    app.view({ _id: _data.bookId }, (err, doc) => {
      if (!err && doc) {
        site.security.getUser(
          {
            id: req.session.user.id,
          },
          (err, user) => {
            if (!err && user) {
              user.booksList = user.booksList || [];
              if (!user.booksList.some((l) => l == doc.id)) {
                user.booksList.push(doc.id);
              }

              site.addPurchaseOrder({
                type: "book",
                target: { id: doc.id, name: doc.name },
                price: doc.price,
                address: _data.address,
                date: site.getDate(),
                host: site.getHostFilter(req.host),
                teacherId: site.getTeacherSetting(req) || doc.teacherId,
                status: site.bookStatusList[0],
                user: {
                  id: user.id,
                  firstName: user.firstName,
                },
              });
              site.security.updateUser(user);
            }
            response.done = true;
            doc.$buy = true;

            response.doc = doc;
            res.json(response);
          }
        );
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });

  site.getBooks = function (req) {
    let setting = site.getSiteSetting(req.host);
    let host = site.getHostFilter(req.host);
    let teacherId = site.getTeacherSetting(req);
    let docs = [];

    for (let i = 0; i < site.bookList.length; i++) {
      let obj = { ...site.bookList[i] };
      obj.$time = site.xtime(obj.date, "Ar");
      if (obj.active && ((!teacherId && obj.host == host) || (teacherId && teacherId == obj.teacherId))) {
        if (req.session.user && req.session.user.type == "student") {
          if (obj.educationalLevel?.id == req.session.user?.educationalLevel?.id && obj.schoolYear?.id == req.session.user?.schoolYear?.id) {
            docs.push(obj);
          }
        } else {
          docs.push(obj);
        }
      }
    }

    return docs.slice(0, setting.lecturesLimit || 10000);
    // }
  };

  app.init();
  site.addApp(app);
};
