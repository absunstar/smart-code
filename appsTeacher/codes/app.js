module.exports = function init(site) {
  let app = {
    name: "codes",
    allowMemory: false,
    memoryList: [],
    allowCache: true,
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
        if (
          (item = app.memoryList.find(
            (itm) => itm.id == _item.id || itm.code == _item.code
          ))
        ) {
          callback(null, item);
          return;
        }
      } else if (app.allowCache) {
        if (
          (item = app.cacheList.find(
            (itm) => itm.id == _item.id || itm.code == _item.code
          ))
        ) {
          callback(null, item);
          return;
        }
      }
      let where = {};
      if (_item.id) {
        where = { id: _item.id };
      } else if (_item.code) {
        where = { code: _item.code };
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
              appName: req.word("Codes"),
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
          _data.distribution = false;
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

      site.post(
        {
          name: `/api/${app.name}/addMany`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };

          let _data = req.data;
          if (_data.count < 1) {
            response.error = "Must Enter Count";
            res.json(response);
            return;
          } else if (_data.price < 1) {
            response.error = "Must Enter Price";
            res.json(response);
            return;
          }
          let codesList = [];
          let host = site.getHostFilter(req.host);
          for (let i = 0; i < _data.count; i++) {
            let code = (size) =>
              [...Array(size)]
                .map(() => Math.floor(Math.random() * 16).toString(16))
                .join("");
            codesList.push({
              code: code(15),
              expired: false,
              distribution: false,
              price: _data.price,
              host,
            });
          }
          app.$collection.insertMany(codesList, (err, docs) => {
            if (!err && docs) {
              response.done = true;
              response.list = docs;
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
          code: 1,
          price: 1,
          expired: 1,
          distribution: 1,
        };
        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, "i"),
          });
          where.$or.push({
            price: site.toNumber(search),
          });
          where.$or.push({
            code: search,
          });
        }
        where["host"] = site.getHostFilter(req.host);
        app.all({ where, select, limit }, (err, docs) => {
          res.json({
            done: true,
            list: docs,
          });
        });
      });
    }
  }

  site.validateCode = function (obj, callBack) {
    callBack = callBack || function () {};

    app.view(
      { code: obj.code },
      (err, doc) => {
        if (doc) {
          if (doc.expired) {
            callBack("Code Expired");
          } else if (!doc.distribution) {
            callBack("Code Not Distribution");
          } else if (doc.price != obj.price) {
            callBack("The code price is not suitable for purchase");
          } else {
            doc.expired = true;
            app.update(doc, (err1, result) => {
              callBack(err1, result);
            });
          }
        } else {
          callBack("Code Not Exist");
        }
      },
      true
    );
  };

  app.init();
  site.addApp(app);
};
