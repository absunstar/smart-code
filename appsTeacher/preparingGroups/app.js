module.exports = function init(site) {
  let app = {
    name: "preparingGroups",
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
              appName: req.word("Preparing Groups"),
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
        if (!_data.date) {
          response.error = "A suitable group must be selected.";
          res.json(response);
          return;
        }
        _data.addUserInfo = req.getUserFinger();
        if ((teacherId = site.getTeacherSetting(req))) {
          _data.teacherId = teacherId;
        }

        _data.host = site.getHostFilter(req.host);
        app.add(_data, (err, doc) => {
          if (!err && doc) {
            response.done = true;
            response.doc = doc;
            site.bookingAppointmentGroup({ groupId: doc.group.id, date: _data.date, day: doc.day });
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

          let _data = req.data.item;
          _data.editUserInfo = req.getUserFinger();

          app.update(_data, (err, result) => {
            if (!err) {
              response.done = true;
              if (!req.data.auto) {
                response.result = result.doc;
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
          group: 1,
          date: 1,
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
        if (where && where.dateFrom && where.dateTo) {
          let d1 = site.toDate(where.dateFrom);
          let d2 = site.toDate(where.dateTo);
          d2.setDate(d2.getDate() + 1);
          where.date = { $gte: d1, $lt: d2 };
          delete where.dateFrom;
          delete where.dateTo;
        } else if (where.dateFrom) {
          let d1 = site.getDate(where.dateFrom);
          let d2 = site.getDate(where.dateFrom);
          d2.setDate(d2.getDate() + 1);
          where.date = { $gte: d1, $lt: d2 };
          delete where.dateFrom;
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

    site.post({ name: `/api/${app.name}/clickMobile`, require: { permissions: ["login"] } }, (req, res) => {
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
  }

  site.post({ name: `/api/${app.name}/removeStudentFromPreparingGroups`, require: { permissions: ["login"] } }, (req, res) => {
    let response = {
      done: false,
    };

    let where = { "group.id": req.body.groupId };
    app.all({ where }, (err, docs) => {
      if (!err) {
        response.done = true;
        if (docs) {
          for (let i = 0; i < docs.length; i++) {
            docs[i].studentList = docs[i].studentList.filter(function (itm) {
              return itm.student.id !== req.body.studentId;
            });
            app.update(docs[i]);
          }
        }
      } else {
        response.error = err?.message || "Not Exists";
      }
      res.json(response);
    });
  });

  site.getPreparingGroups = function (where, callBack) {
    
    callBack = callBack || function () {};
    let select = {
      id: 1,
      group: 1,
      teacher: 1,
      subject: 1,
      studentList: 1,
      date: 1,
      day: 1,
    };
    if (where && where.dateFrom) {
      let d1 = site.toDate(where.dateFrom);
      let d2 = site.toDate(where.dateTo);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
      delete where.dateFrom;
      delete where.dateTo;
    } else if (where.dateFrom) {
      let d1 = site.toDate(where.dateFrom);
      let d2 = site.toDate(where.dateFrom);
      d2.setDate(d2.getDate() + 1);
      where.date = {
        $gte: d1,
        $lt: d2,
      };
    }
    if (where.group && where.group.id) {
      where["group.id"] = where.group.id;
      delete where["group"];
    }

    if (where.student && where.student.id) {
      where["studentList.student.id"] = where.student.id;
      delete where["student"];
    }
    
    app.$collection.findMany({ where : {...where}, select : {...select}, sort: { id: -1 } }, (err, docs) => {      
      callBack(err, docs);
    });
    // }
  };

  site.changeStudentBarcodeForPreparingGroups = function (data) {
    app.$collection.findMany({ host: data.host, "studentList.student.id": data.id }, (err, docs) => {
      if (!err && docs) {
        docs.forEach((_doc) => {
          let index = _doc.studentList.findIndex((itm) => itm.student.id === data.id);
          if (index !== -1) {
            _doc.studentList[index].student.barcode = data.barcode;
            app.update(_doc);
          }
        });
      }
    });
  };
  app.init();
  site.addApp(app);
};
