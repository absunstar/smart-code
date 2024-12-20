module.exports = function init(site) {
  let app = {
    name: "powerOfAttorney",
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
              appName: req.word("Power Of Attorney"),
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

          _data.addUserInfo = req.getUserFinger();
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
        let search = req.body.search || "";
        let limit = req.body.limit || 50;
        let select = req.body.select || {
          id: 1,
          office: 1,
          date: 1,
          number: 1,
          letter: 1,
          year: 1,
          type: 1,
          active: 1,
        };

        if (where.fromDate && where.toDate) {
          let d1 = site.toDate(where.fromDate);
          let d2 = site.toDate(where.toDate);
          d2.setDate(d2.getDate() + 1);
          where.powerOfAttorneyDate = {
            $gte: d1,
            $lte: d2,
          };
          delete where.fromDate;
          delete where.toDate;
        }

        if (app.allowMemory) {
          let list = app.memoryList.filter(
            (g) =>
              (typeof where.active != "boolean" || g.active === where.active) &&
              JSON.stringify(g).contains(where.search)
          );

          res.json({
            done: true,
            list: list.slice(-limit),
          });
        } else {
          if (search) {
            where.$or = [];
            where.$or.push({
              letter: search,
            });
            where.$or.push({
              number: search,
            });
            where.$or.push({
              year: search,
            });
            where.$or.push({
              description: site.get_RegExp(search, "i"),
            });
            where.$or.push({
              "typesPoaList.name": site.get_RegExp(search, "i"),
            });
            where.$or.push({
              "type.name": site.get_RegExp(search, "i"),
            });
          }
          where["host"] = site.getHostFilter(req.host);
          where["office.id"] = { $in: req.session.user.officesList };
          app.all(
            { where: where, limit, select, sort: { id: -1 } },
            (err, docs) => {
              res.json({ done: true, list: docs });
            }
          );
        }
      });

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
                name: doc.name ? doc.name.trim() : "",
                image: {},
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
