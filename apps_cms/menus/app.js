module.exports = function init(site) {
  let app = {
    name: 'menus',
    allowMemory: true,
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
  site.menuList = [];
  site.handleMenus = function () {
    site.menuList = app.memoryList;
    site.menuList.forEach((m, i) => {
      m.host = m.host || '';
      m.type = m.type || {};
      m.$url = '#';
      if (m.type.id === 1 && m.category) {
        m.$url = '/category/' + m.category.id + '/' + m.category.name.replaceAll(' ', '+');
      } else if (m.type.id === 2) {
      } else if (m.type.id === 3) {
      } else if (m.type.id === 4) {
        m.$url = m.internalLink;
      } else if (m.type.id === 5) {
      } else {
      }
    });
    site.menuList = site.menuList.filter((m) => m.active);
    app.menuList = site.menuList.sort((a, b) => a.sort - b.sort);
  };
  app.linkTypeList = [
    {
      id: 1,
      EN: 'Category',
      AR: 'قسم',
    },
    {
      id: 2,
      EN: 'Page',
      AR: 'صفحة',
    },
    {
      id: 3,
      EN: 'External Link',
      AR: 'رابط خارجي',
    },
    {
      id: 4,
      EN: 'Internal Link',
      AR: 'رابط داخلي',
    },
    {
      id: 5,
      EN: 'Main Menu',
      AR: 'قائمة منسدلة',
    },
  ];
  site.onPOST(
    {
      name: '/api/linkTypeList',
    },
    (req, res) => {
      res.json({
        done: true,
        list: app.linkTypeList,
      });
    }
  );

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
              app.memoryList.push({ ...doc });
            });
            site.handleMenus();
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
        site.handleMenus();
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
          site.handleMenus();
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
          site.handleMenus();
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
          let setting = site.getSiteSetting(site.getHostFilter(req.host));
          let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

          res.render(
            app.name + '/index.html',
            {
              setting: setting,
              language: language,
              appName: req.word(app.name),
            },
            { parser: 'html' }
          );
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ['login'] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        _data.host = _data.host || req.host;
        _data.addUserInfo = req.getUserFinger();

        app.add(_data, (err, doc) => {
          if (!err && doc) {
            doc.sort = doc.id;
            app.update(doc, (err, result) => {
              response.done = true;
              response.doc = result.doc;
              res.json(response);
            });
          } else {
            response.error = err.mesage;
            res.json(response);
          }
        });
      });
    }

    if (app.allowRouteUpdate) {
      site.post({ name: `/api/${app.name}/update`, require: { permissions: ['login'] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;
        _data.host = _data.host || req.host;

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
      });
    }

    site.post({ name: `/api/${app.name}/updateSort`, require: { permissions: ['login'] } }, (req, res) => {
      let response = {
        done: false,
      };
      let _data = req.data;
      let ids = [_data.id, _data.id2];
      app.$collection.findMany(
        {
          where: {
            id: { $in: ids },
          },
        },
        (err, docs) => {
          if (!err && docs) {
            let sort0 = docs[0].sort;
            let sort1 = docs[1].sort;
            docs[0].sort = sort1;
            docs[1].sort = sort0;
            app.update(docs[0], (err, result) => {
              if (!err) {
                app.update(docs[1], (err1, result1) => {
                  response.done = true;

                  res.json(response);
                });
              } else {
                response.error = err.message;
                res.json(response);
              }
            });
          } else {
            response.error = err.message;
            res.json(response);
          }
        }
      );
    });

    if (app.allowRouteDelete) {
      site.post({ name: `/api/${app.name}/delete`, require: { permissions: ['login'] } }, (req, res) => {
        let response = {
          done: false,
        };
        let _data = req.data;

        app.delete(_data, (err, result) => {
          if (!err && result.count === 1) {
            response.done = true;
            response.result = result;
          } else {
            response.error = err?.message || 'Deleted Not Exists';
          }
          res.json(response);
        });
      });
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
            response.error = err?.message || 'Not Exists';
          }
          res.json(response);
        });
      });
    }

    if (app.allowRouteAll) {
      site.post({ name: `/api/${app.name}/all`, public: true }, (req, res) => {
        let where = req.body.where || {};
        let search = req.body.search || '';
        let limit = req.body.limit || 100;
        let select = req.body.select || {};

        if (app.allowMemory) {
          app.memoryList.forEach((doc) => {
            let lang = doc.translatedList.find((t) => t.language.id == req.session.lang) || doc.translatedList[0];
            doc.name = lang.name;
            doc.$image = lang.image;
          });

          if (req.body.sort) {
            app.memoryList = app.memoryList.sort((a, b) => a.sort - b.sort);
          }

          res.json({
            done: true,
            list: app.memoryList,
            count: app.memoryList.length,
          });
        } else {
          app.all({ where, select, limit }, (err, docs) => {
            res.json({
              done: true,
              list: docs,
              count: docs.length,
            });
          });
        }
      });
    }
  }

  site.post({ name: '/api/autoCategoriesMenus/all', public: true }, (req, res) => {
    let response = {
      done: false,
    };

    let list = [];
    let topList = [];
    site.categoryList.forEach((doc) => {
      if (doc.active) {
        if (!doc.topParentId) {
          topList.push(doc);
        } else {
          list.push(doc);
        }
      }
    });

    for (let i = 0; i < topList.length; i++) {
      setTimeout(() => {
        let obj = {
          active: true,
          addUserInfo: req.getUserFinger(),
          translatedList: [],
          subList: [],
          type: {
            id: 1,
            en: 'Category',
            ar: 'قسم',
          },
          category: { id: topList[i].id, name: topList[i].translatedList.find((t) => t.language.id == req.session.lang || 'ar').name },
        };
        topList[i].translatedList.forEach((_t) => {
          obj.translatedList.push({
            language: _t.language,
            showImage: true,
            image: _t.imageUrl,
            name: _t.name,
          });
        });
        list.forEach((_subCategory) => {
          if (_subCategory.topParentId == topList[i].id) {
            let sub = {
              active: true,
              translatedList: [],
              subList: [],
              type: {
                id: 1,
                en: 'Category',
                ar: 'قسم',
              },
              category: { id: _subCategory.id, name: _subCategory.translatedList.find((t) => t.language.id == req.session.lang || 'ar').name },
            };
            _subCategory.translatedList.forEach((_t) => {
              sub.translatedList.push({
                language: _t.language,
                showImage: true,
                image: _t.imageUrl,
                name: _t.name,
              });
            });
            obj.subList.push(sub);
          }
        });

        app.add(obj, (err, doc) => {
          if (!err && doc) {
            doc.sort = doc.id;
            app.update(doc);
          }
        });
      }, 1000 * i);
    }

    response.done = true;
    res.json(response);
  });

  app.init();
  site.addApp(app);
};
