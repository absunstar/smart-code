module.exports = function init(site) {
  let app = {
    name: "centers",
    allowMemory: true,
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
              appName: req.word("Centers"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );
      site.get(
        {
          name: "centersView",
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
          res.render(app.name + "/centersView.html", data, {
            parser: "html css js",
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

        _data.addUserInfo = req.getUserFinger();
        _data.host = site.getHostFilter(req.host);
        if ((teacherId = site.getTeacherSetting(req))) {
          _data.teacherId = teacherId;
        // } else {
        //   response.error = "There Is No Teacher";
        //   res.json(response);
        //   return;
        }

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
        let select = req.body.select || {
          id: 1,
          name: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          active: 1,
          host: 1,
        };
        let list = [];
        let teacherId = site.getTeacherSetting(req);
        let host = site.getHostFilter(req.host);
        app.memoryList.forEach((doc) => {
          let obj = { ...doc };
          for (const p in obj) {
            if (!Object.hasOwnProperty.call(select, p)) {
              delete obj[p];
            }
          }
          if ((!where.active || doc.active) && (doc.teacherId === teacherId || (doc.host == host && !teacherId))) {
            if (req.body.view) {
              if (req.session.user && req.session.user.type == "student") {
                if (req.session.user.educationalLevel.id == obj.educationalLevel.id && req.session.user.schoolYear.id == obj.schoolYear.id) {
                  list.push(obj);
                }
              }
              // else if (!req.session.user) {
              //   if (where.educationalLevelId == obj.educationalLevel.id && where.schoolYearId == obj.schoolYear.id) {
              //     list.push(obj);
              //   }
              // }
              else {
                list.push(obj);
              }
            } else {
              list.push(obj);
            }
          }
        });
        res.json({
          done: true,
          list: list,
        });
      });
    }
  }

  app.init();
  site.addApp(app);
};
