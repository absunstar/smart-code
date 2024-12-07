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
        _data.dayList = _data.dayList || [];
        _data.dayList.forEach((d) => {
          d.date = site.getDate(d.date);
        });
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

          let _data = req.data.item;
          _data.editUserInfo = req.getUserFinger();
          _data.dayList = _data.dayList || [];
          _data.dayList.forEach((d) => {
            d.date = site.getDate(d.date);
          });

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
          host: 1,
          name: 1,
          teacher: 1,
          subject: 1,
          active: 1,
          paymentMethod: 1,
          price: 1,
        };
        if (search) {
          where.$or = [];

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

        if (req.body.date) {
          where["dayList.date"] = site.getDate(req.body.date);
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
            let date = site.getDate(_data.date);

            let index = doc.dayList.findIndex(
              (itm) =>
                site.getDate(itm.date).getDate() === date.getDate() &&
                site.getDate(itm.date).getMonth() === date.getMonth() &&
                site.getDate(itm.date).getFullYear() === date.getFullYear() &&
                !itm.isBook
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
          if (_data.type == "validDay" && doc.paymentMethod.name == "lecture") {
            doc.studentList = doc.studentList.map((obj) => ({ ...obj, paidType: "notPaid" }));
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

  site.post({ name: `/api/${app.name}/studentGroups`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let where = req.data;
    app.all(where, (err, docs) => {
      if (!err && docs) {
        response.done = true;
        let list = [];
        for (let i = 0; i < docs.length; i++) {
          let index = docs[i].studentList.findIndex((itm) => itm.student.id === where["studentList.student.id"]);
          if (index !== -1) {
            list.push({
              group: {
                id: docs[i].id,
                name: docs[i].name,
                teacher: docs[i].teacher,
                paymentMethod: docs[i].paymentMethod,
                price: docs[i].price,
                educationalLevel: docs[i].educationalLevel,
                schoolYear: docs[i].schoolYear,
                subject: docs[i].subject,
              },
              discount: docs[i].studentList[index].discount,
              exempt: docs[i].studentList[index].exempt,
              discountValue: docs[i].studentList[index].discountValue,
              requiredPayment: docs[i].studentList[index].requiredPayment,
            });
          }
        }

        response.list = list;
      } else {
        response.error = err?.message || "Not Exists";
      }
      res.json(response);
    });
  });

  site.post({ name: `/api/${app.name}/saveStudentPayment`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let data = req.data;
    app.view({ id: data.groupId }, (err, doc) => {
      if (!err && doc) {
        let index = doc.studentList.findIndex((itm) => itm.student.id === data.studentId);
        if (index !== -1) {
          response.doc = doc.studentList[index];
          doc.studentList[index] = data.studentObject;
          app.update(doc, (err, result) => {
            if (!err) {
              response.done = true;
              response.result = result;
            } else {
              response.error = err.message;
            }
            res.json(response);
          });
        }
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });

  site.post({ name: `/api/${app.name}/getStudentGroupPay`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let where = req.data;
    app.view({ id: where.groupId }, (err, doc) => {
      if (!err && doc) {
        response.done = true;

        let index = doc.studentList.findIndex((itm) => itm.student.id === where.studentId);
        if (index !== -1) {
          response.doc = doc.studentList[index];
        }
      } else {
        response.error = err?.message || "Not Exists";
      }
      res.json(response);
    });
  });

  site.post({ name: `/api/${app.name}/deleteStudentFromGroup`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;
    app.$collection.find({ id: _data.groupId }, (err, doc) => {
      if (!err && doc) {
        response.done = true;
        doc.studentList = doc.studentList.filter((s) => s.student.id !== _data.studentId);
        app.update(doc, (err1, result) => {
          res.json(response);
        });
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });

  site.post({ name: `/api/${app.name}/addStudentToGroup`, public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let _data = req.data;
    app.$collection.find({ id: _data.groupId }, (err, doc) => {
      if (!err && doc) {
        response.done = true;
        doc.studentList.unshift({
          student: { id: _data.student.id, firstName: _data.student.firstName, barcode: _data.student.barcode, mobile: _data.student.mobile, parentMobile: _data.student.parentMobile },
          attend: false,
          discount: _data.discount,
          discountValue: _data.discountValue,
          requiredPayment: _data.requiredPayment,
          exempt: _data.exempt,
        });
        app.update(doc, (err1, result) => {
          res.json(response);
        });
      } else {
        response.error = err?.message || "Not Exists";
        res.json(response);
      }
    });
  });

  site.bookingAppointmentGroup = function (_options) {
    app.view({ id: _options.groupId }, (err, doc) => {
      if (doc) {
        _options.date = site.getDate(_options.date);
        let index = doc.dayList.findIndex(
          (itm) =>
            site.getDate(itm.date).getDate() === _options.date.getDate() &&
            site.getDate(itm.date).getMonth() === _options.date.getMonth() &&
            site.getDate(itm.date).getFullYear() === _options.date.getFullYear() &&
            itm.day.id === _options.day.id
        );
        if (index !== -1) {
          doc.dayList[index].isBook = true;
          app.update(doc);
        }
      }
    });
  };

  site.changeStudentBarcodeForGroups = function (data) {
    console.log(data);
    
    app.$collection.findMany({ host: data.host, "studentList.student.id": data.id }, (err, docs) => {
      console.log(err,docs.length);
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

  site.getGroup = function (where, callBack) {
    callBack = callBack || function () {};
    app.$collection.find(where, (err, doc) => {
      callBack(err, doc);
    });
  };

  site.getGroups = function (where, callBack) {
    callBack = callBack || function () {};
    app.$collection.findMany(where, (err, docs) => {
      callBack(err, docs);
    });
  };

  
  site.addStudentToGroups = function (student, groupList) {
    let idList = [];
    groupList.forEach((element) => {
      idList.push(element.group.id);
    });

    let where = {};
    where["id"] = {
      $in: idList,
    };
    app.all(where, (err, docs) => {
      if (!err && docs) {
        for (let i = 0; i < docs.length; i++) {
          let g = groupList.find((itm) => itm.group.id == docs[i].id);
          docs[i].studentList.unshift({
            student: { id: student.id, firstName: student.firstName, barcode: student.barcode, mobile: student.mobile, parentMobile: student.parentMobile },
            attend: false,
            discount: g.discount,
            discountValue: g.discountValue,
            requiredPayment: g.requiredPayment,
            exempt: g.exempt,
          });
          app.update(docs[i]);
        }
      }
    });
  };

  app.init();
  site.addApp(app);
};
