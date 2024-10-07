module.exports = function init(site) {
  let app = {
    name: "news",
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
  site.newsList = site.newsList || [];
  app.$collection = site.connectCollection(app.name);

  app.init = function () {
    app.$collection.findMany({ sort: { id: -1 } }, (err, docs) => {
      if (!err) {
        docs.forEach((doc) => {
          site.newsList.push({
            _id: doc._id,
            id: doc.id,
            name: doc.name,
            active: doc.active,
            educationalLevel: doc.educationalLevel,
            schoolYear: doc.schoolYear,
            forFaculty: doc.forFaculty,
            forCenter: doc.forCenter,
            date: doc.date,
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
              appName: req.word("News"),
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
            response.done = true;
            response.doc = doc;
            site.newsList.push({
              _id: doc._id,
              id: doc.id,
              name: doc.name,
              active: doc.active,
              educationalLevel: doc.educationalLevel,
              schoolYear: doc.schoolYear,
              forFaculty: doc.forFaculty,
              forCenter: doc.forCenter,
              date: doc.date,
            });
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
              let index = site.newsList.findIndex((a) => a.id === result?.doc?.id);
              if (index !== -1) {
                site.newsList[index] = {
                  _id: result.doc._id,
                  id: result.doc.id,
                  name: result.doc.name,
                  active: result.doc.active,
                  educationalLevel: result.doc.educationalLevel,
                  schoolYear: result.doc.schoolYear,
                  forFaculty: result.doc.forFaculty,
                  forCenter: result.doc.forCenter,
                  date: result.doc.date,
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
              let index = site.newsList.findIndex((a) => a.id === result?.doc?.id);
              if (index !== -1) {
                site.newsList.splice(index, 1);
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
      site.post({ name: `/api/${app.name}/all`, require: { permissions: ["teacher"] } }, (req, res) => {
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 100;
        let select = req.body.select || {
          id: 1,
          image: 1,
          name: 1,
          active: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.toNumber(search),
          });
          where.$or.push({
            serial: site.toNumber(search),
          });
          where.$or.push({
            price: site.toNumber(search),
          });
          where.$or.push({
            code: search,
          });
        }
        if (where.from && where.to) {
          where["serial"] = {
            $gte: where.from,
            $lte: where.to,
          };
          delete where.from;
          delete where.to;
        }
        if ((teacherId = site.getTeacherSetting(req))) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }
        app.all({ where, select, limit, sort: { id: -1 } }, (err, docs) => {
          res.json({
            done: true,
            list: docs,
          });
        });
      });
    }
  }

  site.getNews = function (req) {
    let setting = site.getSiteSetting(req.host);
    let host = site.getHostFilter(req.host);
    let teacherId = site.getTeacherSetting(req);
    let docs = [];

    for (let i = 0; i < site.newsList.length; i++) {
      let obj = { ...site.newsList[i] };
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
