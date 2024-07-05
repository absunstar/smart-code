module.exports = function init(site) {
  let app = {
    name: "lectures",
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
  site.lecturesList = site.lecturesList || [];
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
      if (_item._id) {
        where._id = site.mongodb.ObjectID(_item._id);
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
              appName: req.word("Lectures"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html css js", compres: true }
          );
        }
      );

      site.get(
        {
          name: "view-video",
        },
        (req, res) => {
          app.$collection.find({ _id: site.mongodb.ObjectID(req.query.id) }, (err, lecture) => {
            if (!err && lecture) {
              let video = lecture.linksList.find((itm) => itm.code == req.query.code);
              let videoId = video.url.contains("?v=") ? video.url.split("?v=")[1] : video.url.split("youtu.be/")[1];
              res.render(
                app.name + "/view-video.html",
                {
                  title: app.name,
                  appName: req.word("Video"),
                  setting: site.getSiteSetting(req.host),
                  videoId: video.url.split("?v=")[1],
                },
                { parser: "html css js", compres: true }
              );
            }
          });
        }
      );
      site.get(
        {
          name: "lectureView",
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
            site_footer_logo: setting.footerLogo?.url || "/images/logo.png",
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
            data.site_logo = "//" + req.host + data.site_logo;
            data.site_footer_logo = "//" + req.host + data.site_footer_logo;
            data.page_image = "//" + req.host + data.page_image;
            data.user_image = "//" + req.host + data.user_image;
          }
          res.render(app.name + "/lectureView.html", data, {
            parser: "html css js",
            compres: true,
          });
        }
      );

      site.get(
        {
          name: "lecturesView",
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
          res.render(app.name + "/lecturesView.html", data, {
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
        _data.date = new Date();
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
          if (_data.$quiz) {
            if (!_data.questionsList || _data.questionsList.length < 1) {
              response.error = "Must Add Questions";
              res.json(response);
              return;
            } else {
              let errAnswersList = [];
              let errCorrectAnswersList = [];
              _data.questionsList.forEach((_q) => {
                if (!_q.answersList || _q.answersList.length < 2) {
                  errAnswersList.push(_q.numbering);
                } else {
                  if (!_q.answersList.some((_a) => _a.correct)) {
                    errCorrectAnswersList.push(_q.numbering);
                  }
                }
              });
              if (errAnswersList.length > 0) {
                response.error = `At least two answers must be added to the questions ( ${errAnswersList.join(" - ")} )`;
                res.json(response);
                return;
              } else if (errCorrectAnswersList.length > 0) {
                response.error = `You must choose a correct answer in the questions ( ${errCorrectAnswersList.join(" - ")} )`;
                res.json(response);
                return;
              }
            }
          }
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

    site.post({ name: `/api/${app.name}/changeView`, public: true }, (req, res) => {
      let response = {
        done: false,
      };

      let _data = req.data;
      app.view(_data, (err, doc) => {
        if (!err && doc) {
          let index = doc.linksList.findIndex((itm) => itm.code === _data.code);
          if (index !== -1) {
            doc.linksList[index].views += 1;
          }
          if (!req.session.user && doc.type.name == "public") {
            response.done = true;
            res.json(response);
            return;
          }
          site.security.getUser(
            {
              id: req.session?.user?.id,
            },
            (err, user) => {
              if (!err && user) {
                if (_data.socialBrowserID) {
                  if (user.socialBrowserID) {
                    if (user.socialBrowserID != _data.socialBrowserID) {
                      response.error = "The video cannot be watched due to a new device. Please contact support";
                      res.json(response);
                      return;
                    }
                  } else {
                    user.socialBrowserID = _data.socialBrowserID;
                  }
                }
                let index = user.viewsList.findIndex((itm) => itm.lectureId.toString() === doc._id.toString() && itm.code === _data.code);
                if (index !== -1) {
                  if (user.viewsList[index].views >= doc.numberAvailableViews && doc.typeExpiryView.name == "number") {
                    response.error = "The number of views allowed for this video has been exceeded";
                    res.json(response);
                    return;
                  } else if (doc.typeExpiryView.name == "day") {
                    let obj = { ...user.viewsList[index] };
                    var viewDate = new Date(obj.date);
                    viewDate.setHours(viewDate.getHours() + doc.daysAvailableViewing * 24);
                    if (new Date().getTime() > viewDate.getTime()) {
                      response.error = "The time limit for watching this video has been exceeded";
                      res.json(response);
                      return;
                    }
                  } else if (doc.typeExpiryView.name == "date") {
                    doc.dateAvailableViews = new Date(doc.dateAvailableViews);
                    if (new Date().getTime() > doc.dateAvailableViews.getTime()) {
                      response.error = "The time limit for watching this video has been exceeded";
                      res.json(response);
                      return;
                    }
                  }

                  user.viewsList[index].views += 1;
                } else {
                  user.viewsList.push({
                    lectureId: doc._id,
                    code: _data.code,
                    date: new Date(),
                    views: 1,
                  });
                }
                site.security.updateUser(user);

                app.update(doc, (err, result) => {
                  if (!err) {
                    response.done = true;
                  } else {
                    response.error = err.message;
                  }
                  res.json(response);
                });
              }
            }
          );
        } else {
          response.error = err?.message || "Not Exists";
          res.json(response);
        }
      });
    });

    if (app.allowRouteView) {
      site.post({ name: `/api/${app.name}/view`, public: true }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        app.view(_data, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            if (req.session.user) {
              if (req.session.user.lecturesList && req.session.user.lecturesList.some((s) => s.lectureId.toString() == doc._id.toString())) {
                doc.$buy = true;
                doc.linksList.forEach((_video) => {
                  let index = req.session.user.viewsList.findIndex((itm) => itm.lectureId.toString() === doc._id.toString() && itm.code === _video.code);
                  _video.isValid = false;
                  if (index !== -1) {
                    if (doc.typeExpiryView.name == "number") {
                      _video.remainNumber = doc.numberAvailableViews - req.session.user.viewsList[index].views;
                      if (_video.remainNumber > 1) {
                        _video.isValid = true;
                      }
                      return;
                    } else if (doc.typeExpiryView.name == "day") {
                      var viewDate = new Date(req.session.user.viewsList[index].date);
                      viewDate.setHours(viewDate.getHours() + doc.daysAvailableViewing * 24);
                      let newDate = new Date();
                      let diffTime = Math.abs(viewDate - newDate);

                      _video.remainDay = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                      if (_video.remainDay > 1) {
                        _video.isValid = true;
                      }
                    } else if (doc.typeExpiryView.name == "date") {
                      _video.remainDate = doc.dateAvailableViews;
                      if (new Date().getTime() <= doc.dateAvailableViews.getTime()) {
                        _video.isValid = true;
                      }
                    }
                  } else {
                    _video.isValid = true;

                    if (doc.typeExpiryView.name == "number") {
                      _video.remainNumber = doc.numberAvailableViews;
                    } else if (doc.typeExpiryView.name == "day") {
                      _video.remainDay = doc.daysAvailableViewing;
                    } else if (doc.typeExpiryView.name == "date") {
                      _video.remainDate = doc.dateAvailableViews;
                    }
                  }
                });
              }
            } else {
              doc.linksList.forEach((_video) => {
                _video.isValid = true;
              });
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
          activateQuiz: 1,
          image: 1,
          educationalLevel: 1,
          schoolYear: 1,
          placeType: 1,
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
          if (req.session.user && req.session.user.type == "student" && req.session.user.lecturesList) {
            let idList = [];
            req.session.user.lecturesList.forEach((element) => {
              idList.push(site.mongodb.ObjectID(element.lectureId));
            });
            where["_id"] = {
              $in: idList,
            };
          }
        }
        where["host"] = site.getHostFilter(req.host);
        app.all({ where, select, limit, sort: { id: -1 } }, (err, docs) => {
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
    app.view({ id: _data.lectureId }, (err, doc) => {
      if (!err && doc) {
        site.validateCode({ code: _data.code, price: _data.lecturePrice }, (errCode, code) => {
          if (errCode && _data.lecturePrice > 0) {
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
                  user.lecturesList = user.lecturesList || [];
                  if (!user.lecturesList.some((l) => l.lectureId.toString() == doc._id.toString())) {
                    user.lecturesList.push({
                      lectureId: site.mongodb.ObjectID(doc._id),
                    });
                  }
                  site.addPurchaseOrder({
                    type: "lecture",
                    target: { id: doc._id, name: doc.name },
                    price: doc.price,
                    code: _data.code,
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

  site.getLecturesToStudent = function (req, callBack) {
    callBack = callBack || function () {};
    let select = {
      id: 1,
      name: 1,
      image: 1,
      price: 1,
      activateQuiz: 1,
    };
    let where = {};
    site.security.getUser({ _id: req.body.studentId }, (err, user) => {
      if (!err) {
        if (user) {
          let idList = [];
          user.lecturesList.forEach((element) => {
            idList.push(site.mongodb.ObjectID(element.lectureId));
          });

          where["_id"] = {
            $in: idList,
          };
          app.$collection.findMany({ where, select, sort: { id: -1 } }, (err, docs) => {
            callBack(err, docs);
          });
        } else {
          callBack(err, null);

          return;
        }
      } else {
        callBack(err, null);
      }
    });
  
  };

  site.getLectures = function (req, callBack) {
    callBack = callBack || function () {};
    site.lecturesList = [];
    let setting = site.getSiteSetting(req.host);
    let limit = setting.lecturesLimit || 6;
    let select = req.body.select || {
      id: 1,
      name: 1,
      image: 1,
      description: 1,
      price: 1,
      date: 1,
    };
    // let lectures = [];
    // if (req.session.user && req.session.user.type == "student") {
    //   lectures = site.lecturesList.filter(
    //     (a) =>
    //       a.host == site.getHostFilter(req.host) &&
    //       (a.placeType == req.session.user.placeType || a.placeType == "both") &&
    //       a.schoolYear.id == req.session.user.schoolYear.id &&
    //       a.educationalLevel.id == req.session.user.educationalLevel.id
    //   );
    // } else {
    //   lectures = site.lecturesList.filter((a) => a.host == site.getHostFilter(req.host));
    // }
    // if (lectures.length > 0) {
    //   callBack(null, lectures);
    // } else {
    let where = {};
    if (req.session.user && req.session.user.type == "student") {
      where["educationalLevel.id"] = req.session.user.educationalLevel.id;
      where["schoolYear.id"] = req.session.user.schoolYear.id;

      where.$or = [{ placeType: req.session.user.placeType }, { placeType: "both" }];
    }
    where["active"] = true;
    where["host"] = site.getHostFilter(req.host);
    app.$collection.findMany({ where, select, limit, sort: { id: -1 } }, (err, docs) => {
      if (!err && docs) {
        for (let i = 0; i < docs.length; i++) {
          if (docs[i].price == 0) {
            docs[i].$isFree = true;
          }

          if (!site.lecturesList.some((k) => k.id === docs[i].id)) {
            docs[i].time = site.xtime(docs[i].date, "Ar");
            site.lecturesList.push(docs[i]);
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
