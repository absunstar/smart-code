module.exports = function init(site) {
  let app = {
    name: "subscriptions",
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
        if ((item = app.memoryList.find((itm) => itm.id == _item.id || itm._id == _item._id))) {
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
      if (where._id) {
        where = { _id: _item._id };
      } else {
        where = { id: _item.id };
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

  site.get(
    {
      name: "subscriptionView",
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
      res.render(app.name + "/subscriptionView.html", data, {
        parser: "html css js",
        compres: true,
      });
    }
  );

  site.get(
    {
      name: "subscriptionsView",
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

      res.render(app.name + "/subscriptionsView.html", data, {
        parser: "html css js",
        compres: true,
      });
    }
  );

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
              appName: req.word("Subscriptions"),
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

        let _data = req.data;

        _data.addUserInfo = req.getUserFinger();
        if ((teacherId = site.getTeacherSetting(req))) {
          _data.teacherId = teacherId;
        }

        _data.host = site.getHostFilter(req.host);
        app.add(_data, (err, doc) => {
          if (!err && doc) {
            let setting = site.getSiteSetting(req.host);
            if (setting.isShared) {
              doc.code = (req.session?.user?.prefix || req.session?.user?.id.toString()) + "P" + doc.id.toString();
            } else {
              doc.code = (setting.teacher.prefix || req.session?.user?.id.toString()) + "P" + doc.id.toString();
            }
            app.update(doc, (err, result) => {
              if (!err && result) {
                response.done = true;
                response.doc = result.doc;
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
            if (req.session.user && req.session.user.subscriptionList && req.session.user.subscriptionList.some((s) => s == doc.id)) {
              doc.$buy = true;
            }
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
        let search = req.body.search || "id";
        let select = req.body.select || { id: 1, name: 1, code: 1,price: 1, active: 1 , image: 1 };
        let list = [];
        let teacherId = site.getTeacherSetting(req);
        let host = site.getHostFilter(req.host);
        let setting = site.getSiteSetting(req.host);

        if(req.body.type == 'toStudent' && !where['mySubscriptions']) {
          if(!where.educationalLevel) {
            where.educationalLevel = req.session?.user?.educationalLevel
          }
          if(!where.schoolYear){
            where.schoolYear = req.session?.user?.schoolYear
          }
        }
        
        app.memoryList.forEach((doc) => {
          let obj = { ...doc };

          if ((!where.active || doc.active) && ((doc.teacherId === teacherId && !setting.isShared) || (doc.host == host && setting.isShared)) && JSON.stringify(obj).contains(search)) {
            
            if (
              (!where.mySubscriptions || req.session?.user?.subscriptionList?.some((s) => s == obj.id)) &&
              (!where.educationalLevel?.id || where.educationalLevel?.id == obj.educationalLevel.id) &&
              (!where.schoolYear?.id || (!obj.schoolYear && !obj?.schoolYear?.id) || where.schoolYear?.id == obj?.schoolYear?.id) &&
              (!where.subject?.id || where.subject?.id == obj.subject.id)
            ) {
              list.push(obj);
            }
          }

          for (const p in obj) {
            if (!Object.hasOwnProperty.call(select, p)) {
              delete obj[p];
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

  site.post({ name: `/api/${app.name}/buyCode`, require: { permissions: ["login"] } }, (req, res) => {
    let response = {
      done: false,
    };
    if (!req.session.user) {
      response.error = "You are not login";
      res.json(response);
    }
    let _data = req.data;
    app.view({ id: _data.subscriptionId }, (err, doc) => {
      if (!err && doc) {
        if (!_data.purchase || !_data.purchase.purchaseType || !_data.purchase.purchaseType.name) {
          response.error = req.word("Must Select Purchase Type");
          res.json(response);
          return;
        } else if (_data.purchase.purchaseType.name == "code" && !_data.purchase.code) {
          response.error = req.word("The code must be entered");
          res.json(response);
          return;
        } else if (_data.purchase.purchaseType.name != "code" && !_data.purchase.numberTransferFrom) {
          response.error = req.word("The account number to be transferred from must be entered");
          res.json(response);
          return;
        }
        site.getPurchaseSubscription({ subscriptionId: doc.id, "user.id": req.session?.user?.id }, (err1, order) => {
          if (order) {
            response.error = req.word("The subscription has already been purchased");
            res.json(response);
            return;
          }
          site.validateCode(req, { code: _data.purchase?.code, price: doc.price }, (errCode, code) => {
            if (errCode && doc.price > 0 && _data.purchase.purchaseType.name == "code") {
              response.error = req.word(errCode);
              res.json(response);
              return;
            } else {
              site.security.getUser(
                {
                  id: req.session.user.id,
                },
                (err, user) => {
                  if (!err && user) {
                    user.subscriptionList = user.subscriptionList || [];

                    if (_data.purchase.purchaseType.name == "code") {
                      user.subscriptionList.push(doc.id);
                    }
                    site.addPurchaseSubscription({
                      subscriptionId: doc.id,
                      subscriptionName: doc.name,
                      price: doc.price,
                      purchaseType: {
                        name: _data.purchase.purchaseType.name,
                        nameAr: _data.purchase.purchaseType.nameAr,
                        nameEn: _data.purchase.purchaseType.nameEn,
                      },
                      done: _data.purchase?.purchaseType?.name == "code" ? true : false,
                      code: _data.purchase.code,
                      numberTransferFrom: _data.purchase.numberTransferFrom,
                      imageTransfer: _data.purchase.imageTransfer,
                      date: site.getDate(),
                      host: site.getHostFilter(req.host),
                      teacherId: site.getTeacherSetting(req) || doc.teacherId,
                      user: {
                        id: user.id,
                        firstName: user.firstName,
                      },
                    });
                    site.security.updateUser(user);
                  }
                  response.done = true;
                  // doc.$buy = true;
                  // doc.$time = site.xtime(doc.date, req.session.lang || "ar");
                  // response.doc = doc;
                  res.json(response);
                }
              );
            }
          });
        });
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });


  site.getSubscriptions = function (req) {
    let setting = site.getSiteSetting(req.host);
    let host = site.getHostFilter(req.host);
    let teacherId = site.getTeacherSetting(req);
    let docs = [];

    for (let i = 0; i < app.memoryList.length; i++) {
      let obj = { ...app.memoryList[i] };
      obj.$time = site.xtime(obj.date, "Ar");
      if (obj.active && ((!teacherId && obj.host == host) || (teacherId && teacherId == obj.teacherId))) {
        if (req.session.user && req.session.user.type == "student") {
          if ((!obj.educationalLevel?.id || obj.educationalLevel?.id == req.session.user?.educationalLevel?.id) && (!obj.schoolYear?.id || obj.schoolYear?.id == req.session.user?.schoolYear?.id)) {
            docs.push(obj);
          }
        } else {
          docs.push(obj);
        }
      }
    }

    return docs.slice(0, setting.newsLimit || 10);
    // }
  };
  app.init();
  site.addApp(app);
};
