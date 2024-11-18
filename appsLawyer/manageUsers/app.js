module.exports = function init(site) {
  let app = {
    name: "manageUsers",
    allowMemory: false,
    memoryList: [],
    newList: [],
    activeList: [],
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

  app.$collection = site.connectCollection("officeUsers");
  app.$collectionUser = site.connectCollection("users_info");

  app.init = function () {
    app.$collectionUser.findMany({ sort: { id: -1 } }, (err, docs) => {
      if (!err) {
        docs.forEach((doc) => {
          if (doc.active && doc.roles && doc.roles[0].name == "lawyer") {
            let obj = {
              id: doc.id,
              image: doc.image,
              firstName: doc.firstName,
              lastName: doc.lastName,
            };
            app.newList.push({ ...obj });
            app.activeList.push({ ...obj, specialty: doc.specialties ? doc.specialties[0] : {} });
          }
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
              appName: req.word("Manage Users"),
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

          app.$collectionUser.update(_data, (err, result) => {
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
          app.$collectionUser.delete({ id: _data.id }, (err, result) => {
            if (!err && result.count === 1) {
              response.done = true;
              response.result = result;
              res.json(response);
            } else {
              response.error = err?.message || "Deleted Not Exists";
              res.json(response);
            }
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
        let search = req.body.search || "";
        let limit = req.body.limit || 50;
        let select = req.body.select || {
          id: 1,
          userId: 1,
          type: 1,
          office: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            firstName: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            lastName: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            idNumber: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            "gender.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gender.nameEn": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "maritalStatus.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "maritalStatus.nameEn": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            phone: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            mobile: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            whatsapp: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            socialEmail: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            address: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            "gov.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "city.name": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "area.name": site.get_RegExp(search, "i"),
          });
        }
        where["id"] = { $ne: 1 };
        where["host"] = site.getHostFilter(req.host);
        app.$collectionUser.findMany(where, (err, users) => {
          res.json({
            done: true,
            list: users,
          });
        });
      });

      site.post(
        {
          name: `/api/${app.name}/addUsers`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;

          let where = {};
          where["email"] = _data.email;
          app.$collectionUser.findMany(where, (err1, docs) => {
            if (docs && docs.length) {
              response.error = "Email is exist";
              res.json(response);
              return;
            } else if (err1) {
              response.error = err1?.message || "Has Err";
              res.json(response);
              return;
            }

            if (!_data.email) {
              let splitName = _data.fullNameEn.split(" ");
              let emailAndPass = splitName[0] + Math.floor(Math.random() * 1000 + 1).toString();
              _data.email = emailAndPass;
              _data.password = emailAndPass;
            }
            _data.roles = [{ name: _data.$role }];
            if (_data.$role == "lawyer") {
              _data.type = _data.$role;
            } else {
              _data.type = "client";
            }
            // if (_data.mobileList && _data.mobileList.length > 0) {
            //   _data.mobile = _data.mobileList[0].mobile;
            // } else {
            //   response.error = "Must Add Mobile Number";
            //   res.json(response);
            //   return;
            // }
            let office = { ..._data.office };
            if (_data.office) {
              _data.officesList = [_data.office.id];
              delete _data.office;
            }
            _data.addUserInfo = req.getUserFinger();
            let host = site.getHostFilter(req.host);
            _data.host = host;
            app.$collectionUser.add(_data, (err, doc) => {
              if (!err && doc) {
                let userOffice = {
                  userId: doc.id,
                  host: host,
                  office,
                  type: _data.$role,
                  addUserInfo: doc.addUserInfo,
                };
                app.add(userOffice, (err, userOfficeDoc) => {
                  if (!err && userOfficeDoc) {
                    response.done = true;
                    response.doc = userOfficeDoc;
                  } else {
                    response.error = err?.message || "Add Not Exists";
                  }
                  res.json(response);
                });
              } else {
                response.error = err?.message || "Add Not Exists";
              }
            });
          });
        }
      );
    }
  }

  app.init();
  site.addApp(app);
};
