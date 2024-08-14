module.exports = function init(site) {
  let app = {
    name: "groups",
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
              appName: req.word("Groups"),
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
      site.post({ name: `/api/${app.name}/view`, require: { permissions: ["login"] } }, (req, res) => {
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
      site.post({ name: `/api/${app.name}/all`, require: { permissions: ["login"] } }, (req, res) => {
        let setting = site.getSiteSetting(req.host);
        let where = req.body.where || {};
        let search = req.body.search || "";
        let limit = req.body.limit || 50;
        let select = req.body.select || {
          id: 1,
          name: 1,
          teacher: 1,
          subject: 1,
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
          where.$or.push({
            "subject.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "teacher.firstName": site.get_RegExp(search, "i"),
          });
        }

        if ((teacherId = site.getTeacherSetting(req)) && !setting.isCenter) {
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

    site.post({ name: `/api/${app.name}/handleToPreparingGroup`, require: { permissions: ["login"] } }, (req, res) => {
      let response = {
        done: false,
      };

      let _data = req.data;
      app.view(_data, (err, doc) => {
        if (!err && doc) {
          response.done = true;
          let result = {};
          if (_data.type == "validDay") {
            let date = new Date(_data.date);
            let index = doc.dayList.findIndex(
              (itm) => new Date(itm.date).getDate() === date.getDate() && new Date(itm.date).getMonth() === date.getMonth() && new Date(itm.date).getFullYear() === date.getFullYear() && !itm.isBook
            );
            if (index !== -1) {
              if (!doc.dayList[index].isBook) {
                result.validDay = doc.dayList[index];
              } else {
                response.error = "Today's lecture is already booked.";
                res.json(response);
                return;
              }
            } else {
              response.error = "There are no lectures available today";
              res.json(response);
              return;
            }
            result.date = date;
          }
          result.studentList = doc.studentList;
          response.doc = result;
          res.json(response);
        } else {
          response.error = err?.message || "Not Exists";
          res.json(response);
        }
      });
    });
  }

  site.post({ name: `/api/${app.name}/clickMobile`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;
    app.view(_data, (err, doc) => {
      if (!err && doc) {
        response.done = true;
        let index = doc.studentList.findIndex((itm) => itm.student.id === _data.studentId);
        if (index !== -1) {
          if (_data.type == "studentMobile") {
            doc.studentList[index].clickStudentMoblie = true;
          } else if (_data.type == "parentMobile") {
            doc.studentList[index].clickSParentMobile = true;
          }
          app.update(doc);
        }
      } else {
        response.error = err?.message || "Not Exists";
      }
      res.json(response);
    });
  });

  site.bookingAppointmentGroup = function (_options) {
    app.view({ id: _options.groupId }, (err, doc) => {
      if (doc) {
        _options.date = new Date(_options.date);
        let index = doc.dayList.findIndex(
          (itm) =>
            new Date(itm.date).getDate() === _options.date.getDate() &&
            new Date(itm.date).getMonth() === _options.date.getMonth() &&
            new Date(itm.date).getFullYear() === _options.date.getFullYear() &&
            itm.day.id === _options.day.id
        );
        if (index !== -1) {
          doc.dayList[index].isBook = true;
          app.update(doc);
        }
      }
    });
  };

  app.init();
  site.addApp(app);
};
