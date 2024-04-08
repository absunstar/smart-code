module.exports = function init(site) {
  let app = {
    name: "officeUsers",
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

  app.$collection = site.connectCollection("officeUsers");
  app.$collectionUser = site.connectCollection("users_info");

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
          let index = app.memoryList.findIndex(
            (itm) => itm.id === result.doc.id
          );
          if (index !== -1) {
            app.memoryList[index] = result.doc;
          } else {
            app.memoryList.push(result.doc);
          }
        } else if (app.allowCache && !err && result) {
          let index = app.cacheList.findIndex(
            (itm) => itm.id === result.doc.id
          );
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
              appName: "Office Users",
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post(
        { name: `/api/${app.name}/add`, require: { permissions: ["login"] } },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;

          app.add(_data, (err, doc) => {
            if (!err && doc) {
              response.done = true;
              response.doc = doc;
            } else {
              response.error = err.mesage;
            }
            res.json(response);
          });
        }
      );
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

          app.$collection.delete(_data, (err, result) => {
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
            nameAr: site.get_RegExp(search, "i"),
          });

          where.$or.push({
            nameEn: site.get_RegExp(search, "i"),
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
            "gov.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "gov.nameEn": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "city.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "city.nameEn": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "area.nameAr": site.get_RegExp(search, "i"),
          });
          where.$or.push({
            "area.nameEn": site.get_RegExp(search, "i"),
          });
        }
        where["office.id"] = { $in: req.session.user.officesList };
        where["type"] = req.body.type;
        app.all({ where, select, limit }, (err, docs) => {
          if (docs && docs.length > 0) {
            let usersIdList = [];
            docs.forEach((_doc) => {
              usersIdList.push(_doc.userId);
            });
            let whereUsers = {
              id: { $in: usersIdList },
            };
            app.$collectionUser.findMany(whereUsers, (err, users) => {
              users.forEach(_user => {
                item = docs.find((itm) => itm.userId == _user.id);
                _user.office = item.office;
                _user.docId = item.id;
              });
              res.json({
                done: true,
                list: users,
              });
            });
          } else {
            res.json({
              done: true,
              list: [],
            });
          }
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
              let emailAndPass =
                splitName[0] + Math.floor(Math.random() * 1000 + 1).toString();
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
            const office = { ..._data.office };
            if (_data.office) {
              _data.officesList = [_data.office.id];
              delete _data.office;
            }
            _data.addUserInfo = req.getUserFinger();

            app.$collectionUser.add(_data, (err, doc) => {
              if (!err && doc) {
                let userOffice = {
                  userId: doc.id,
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

      site.post(
        {
          name: `/api/${app.name}/addEmployee`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;

          let where = {
            $and: [
              { userId: _data.userId },
              { "office.id": _data.office.id },
              // { type: _data.type },
            ],
          };
          app.all({ where }, (err1, docs) => {
            if (docs && docs.length) {
              response.error = "User is exist";
              res.json(response);
              return;
            } else if (err1) {
              response.error = err1?.message || "Has Err";
              res.json(response);
              return;
            }

            _data.addUserInfo = req.getUserFinger();

            app.$collectionUser.findOne({ id: _data.userId }, (err1, user) => {
              app.add(_data, (err, doc) => {
                if (!err && doc) {
                  user.officesList.push(doc.office.id);
                  app.$collectionUser.update(user);
                  response.done = true;
                  response.doc = doc;
                  res.json(response);
                } else {
                  response.error = err?.message || "Add Not Exists";
                }
                res.json(response);
              });
            });
          });
        }
      );

      site.post(`api/${app.name}/import`, (req, res) => {
        let response = {
          done: false,
          file: req.form.files.fileToUpload,
        };

        if (site.isFileExistsSync(response.file.filepath)) {
          let docs = [];
          if (response.file.originalFilename.like("*.xls*")) {
            let workbook = site.XLSX.readFile(response.file.filepath);
            docs = site.XLSX.utils.sheet_to_json(
              workbook.Sheets[workbook.SheetNames[0]]
            );
          } else {
            docs = site.fromJson(
              site.readFileSync(response.file.filepath).toString()
            );
          }

          if (Array.isArray(docs)) {
            console.log(`Importing ${app.name} : ${docs.length}`);
            docs.forEach((doc) => {
              let newDoc = {
                nameAr: doc.nameAr,
                nameEn: doc.nameEn,
                email: doc.email,
                mobile: "0" + doc.mobile,
                image: { url: "/images/officeUsers.png" },
                active: true,
              };

              newDoc.company = site.getCompany(req);
              newDoc.branch = site.getBranch(req);
              newDoc.addUserInfo = req.getUserFinger();

              app.add(newDoc, (err, doc2) => {
                if (!err && doc2) {
                  site.dbMessage = `Importing ${app.name} : ${doc2.id}`;
                  console.log(site.dbMessage);
                } else {
                  site.dbMessage = err.message;
                  console.log(site.dbMessage);
                }
              });
            });
          } else {
            site.dbMessage =
              "can not import unknown type : " + site.typeof(docs);
            console.log(site.dbMessage);
          }
        } else {
          site.dbMessage = "file not exists : " + response.file.filepath;
          console.log(site.dbMessage);
        }

        res.json(response);
      });
    }
  }

  app.init();
  site.addApp(app);
};
