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
              appName: req.word("Lectures"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html css js", compres: true }
          );
        }
      );

      site.get(
        {
          name: "lectureView",
        },
        (req, res) => {
          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
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
          let setting = site.getSiteSetting(req.host);
          setting.description = setting.description || "";
          setting.keyWordsList = setting.keyWordsList || [];
          let data = {
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
          site.security.getUser(
            {
              id: req.session.user.id,
            },
            (err, user) => {
              if (!err && user) {
                let index = user.viewsList.findIndex((itm) => itm.lectureId === doc.id && itm.code === _data.code);
                if (index !== -1) {
                  if (user.viewsList[index].views >= doc.numberViews && doc.typeExpiryView.name == "number") {
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
                    doc.viewingEndDate = new Date(doc.viewingEndDate);
                    if (new Date().getTime() > doc.viewingEndDate.getTime()) {
                      response.error = "The time limit for watching this video has been exceeded";
                      res.json(response);
                      return;
                    }
                  }

                  user.viewsList[index].views += 1;
                } else {
                  user.viewsList.push({
                    lectureId: doc.id,
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
            if (req.session.user && req.session.user.lecturesList && req.session.user.lecturesList.some((s) => s.lectureId == doc.id)) {
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
          if (req.session.user && req.session.user.type == "student") {
            let idList = req.session.user.lecturesList.map((_item) => _item.lectureId);
            where["id"] = {
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
    app.view({ id: _data.lectureId }, (err, doc) => {
      if (!err && doc) {
        site.validateCode({ code: _data.code, price: _data.lecturePrice }, (errCode, code) => {
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
                  user.lecturesList = user.lecturesList || [];
                  if (!user.lecturesList.some((l) => l.id == doc.id)) {
                    user.lecturesList.push({
                      lectureId: doc.id,
                    });
                  }
                  site.addPurchaseOrder({
                    type: "lecture",
                    target: { id: doc.id, name: doc.name },
                    price: doc.price,
                    date: new Date(),
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

  site.getLectures = function (req, callBack) {
    callBack = callBack || function () {};
    let lectures = [];
    if (req.session.user && req.session.user.type == "student") {
      lectures = site.lecturesList.filter(
        (a) =>
          a.host == site.getHostFilter(req.host) &&
          (a.placeType == req.session.user.placeType || a.placeType == "both") &&
          a.schoolYear.id == req.session.user.schoolYear.id &&
          a.educationalLevel.id == req.session.user.educationalLevel.id
      );
    } else {
      lectures = site.lecturesList.filter((a) => a.host == site.getHostFilter(req.host));
    }
    if (lectures.length > 0) {
      callBack(null, lectures);
    } else {
      let where = {};
      if (req.session.user && req.session.user.type == "student") {
        where["educationalLevel.id"] = req.session.user.educationalLevel.id;
        where["schoolYear.id"] = req.session.user.schoolYear.id;
        where["host"] = site.getHostFilter(req.host);
        where["active"] = true;

        where.$or = [{ placeType: req.session.user.placeType }, { placeType: "both" }];
      }
      app.$collection.findMany(where, (err, docs) => {
        if (!err && docs) {
          for (let i = 0; i < docs.length; i++) {
            let doc = docs[i];
            if (!site.lecturesList.some((k) => k.id === doc.id)) {
              doc.$time = site.xtime(doc.date, "Ar");

              site.lecturesList.push(doc);
            }
          }
        }
        callBack(err, docs);
      });
    }
  };

  app.init();
  site.addApp(app);
};
