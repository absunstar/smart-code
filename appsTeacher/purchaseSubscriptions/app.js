module.exports = function init(site) {
  let app = {
    name: "purchaseSubscriptions",
    allowMemory: false,
    memoryList: [],
    allowCache: false,
    cacheList: [],
    allowRoute: true,
    allowRouteGet: true,
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
              appName: req.word("Purchases Subscriptions"),
              setting: site.getSiteSetting(req.host),
            },
            { parser: "html", compres: true }
          );
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
      site.post(
        {
          name: `/api/${app.name}/updateStatus`,
          require: { permissions: ["login"] },
        },
        (req, res) => {
          let response = {
            done: false,
          };
          let _data = req.data;
          app.view({ id: _data.id }, (err, doc) => {
            doc.editUserInfo = req.getUserFinger();
            if (_data.type == "done") {
              doc.done = true;
            }
            app.update(doc, (err, result) => {
              if (!err) {
                response.done = true;
                response.doc = result.doc;
                site.security.getUser(
                  {
                    id: doc.user.id,
                  },
                  (err, user) => {
                    if (!err && user) {
                      if (doc.purchaseType.name != "code") {
                        user.subscriptionList = user.subscriptionList || [];
                        if (!user.subscriptionList.some((l) => l == doc.subscriptionId)) {
                          user.subscriptionList.push(doc.subscriptionId);
                        }

                        site.security.updateUser(user);
                      }
                    }
                  }
                );
              } else {
                response.error = err.message;
              }
              res.json(response);
            });
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
        let limit = req.body.limit || 10000;
        let select = req.body.select || {
          id: 1,
          code: 1,
          price: 1,
          subscriptionName: 1,
          user: 1,
          status: 1,
          date: 1,
          purchaseType: 1,
          numberTransferFrom: 1,
          imageTransfer: 1,
          done: 1,
        };
        if (where && where.fromDate && where.toDate) {
          let d1 = site.toDate(where.fromDate);
          let d2 = site.toDate(where.toDate);
          d2.setDate(d2.getDate() + 1);
          where.date = {
            $gte: d1,
            $lte: d2,
          };
          delete where.fromDate;
          delete where.toDate;
        }
        if (where["package"]) {
          where["target.id"] = where["package"].id;
          delete where["package"];
        }

        if (where["book"]) {
          where["target.id"] = where["book"].id;
          delete where["book"];
        }

        if (where["purchaseType"]) {
          where["purchaseType.name"] = where["purchaseType"].name;
          delete where["purchaseType"];
        }

        if (where["lecture"]) {
          where["target.id"] = where["lecture"].id;
          delete where["lecture"];
        }

        if (where["subscription"]) {
          where["subscriptionId"] = where["subscription"].id;
          delete where["subscription"];
        }

        if (where["status"]) {
          where["status.name"] = where["status"].name;
          delete where["status"];
        }

        if (where["targetType"]) {
          where["type"] = where["targetType"].name;
          delete where["targetType"];
        }

        if (where["student"]) {
          where["user.id"] = where["student"].id;
          delete where["student"];
        }

        if (where["search"]) {
          where.$or = [];

          where.$or.push(
            { code: where["search"] },
            { "user.firstName": site.get_RegExp(where["search"], "i") },
            { "user.lastName": site.get_RegExp(where["search"], "i") },
            { "target.name": site.get_RegExp(where["search"], "i") }
          );

          delete where["search"];
        }
        if ((teacherId = site.getTeacherSetting(req))) {
          where["teacherId"] = teacherId;
        } else {
          where["host"] = site.getHostFilter(req.host);
        }

        app.all({ where: where, limit, select, sort: { id: -1 } }, (err, docs) => {
          let totalPurchases = 0;
          for (let i = 0; i < docs.length; i++) {
            totalPurchases += docs[i].price;
          }
          res.json({
            done: true,
            list: docs,
            totalPurchases,
          });
        });
      });
    }
  }

  site.addPurchaseSubscription = function (_options) {
    app.add(_options);
  };

  site.getPurchaseSubscription = function (where, callBack) {
    callBack = callBack || function () {};
    app.$collection.find(where, (err, doc) => {
      callBack(err, doc);
    });
  };

  app.init();
  site.addApp(app);
};
