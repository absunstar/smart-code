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
  site.handleMenus = function () {
    site.menuList = app.memoryList;
    site.menuList.forEach((m) => {
      m.type = m.type || {};
      if (m.type.id === 1 && m.category) {
        m.$url = '/category/' + m.category.id + '/' + m.category.name.replaceAll(' ', '+');
      } else if (m.type.id === 2) {
      } else if (m.type.id === 3) {
      } else if (m.type.id === 4) {
      } else {
        m.active = false;
      }
    });
    site.menuList = site.menuList.filter((m) => m.active);
    site.menuList1 = site.menuList.map((c) => ({ id: c.id, name: c.translatedList[0].name, url: c.$url })).splice(0, 8);
    site.menuList2 = site.menuList.map((c) => ({ id: c.id, name: c.translatedList[0].name, url: c.$url })).splice(8, 20);
    site.menuList3 = site.menuList.map((c) => ({ id: c.id, name: c.translatedList[0].name, url: c.$url })).splice(20);
  };
  app.linkTypeList = [
    {
      id: 1,
      en: 'Category',
      ar: 'قسم',
    },
    {
      id: 2,
      en: 'Page',
      ar: 'صفحة',
    },
    {
      id: 3,
      en: 'External Link',
      ar: 'رابط خارجي',
    },
    {
      id: 4,
      en: 'Internal Link',
      ar: 'رابط داخلي',
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
              app.memoryList.push(doc);
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
          res.render(app.name + '/index.html', { title: app.name, appName: '##word.menus##', setting: site.setting }, { parser: 'html', compres: true });
        }
      );
    }

    if (app.allowRouteAdd) {
      site.post({ name: `/api/${app.name}/add`, require: { permissions: ['login'] } }, (req, res) => {
        let response = {
          done: false,
        };

        let _data = req.data;

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
        let select = req.body.select || { id: 1, code: 1, name: 1, image: 1, callingCode: 1 };

        if (search) {
          where.$or = [];

          where.$or.push({
            id: site.get_RegExp(search, 'i'),
          });

          where.$or.push({
            code: site.get_RegExp(search, 'i'),
          });

          where.$or.push({
            nameAr: site.get_RegExp(search, 'i'),
          });

          where.$or.push({
            nameEn: site.get_RegExp(search, 'i'),
          });
        }
        if (app.allowMemory) {
          if (!search) {
            search = 'id';
          }
          let docs = [];
          let list = app.memoryList.filter((g) => (typeof where.active != 'boolean' || g.active === where.active) && JSON.stringify(g).contains(search)).slice(0, limit);
          list.forEach((doc) => {
            if (doc && doc.translatedList) {
              if ((langDoc = doc.translatedList.find((t) => t.language.id == req.session.lang))) {
                let obj = {
                  ...doc,
                  ...langDoc,
                };

                for (const p in obj) {
                  if (!Object.hasOwnProperty.call(select, p)) {
                    delete obj[p];
                  }
                }
                docs.push(obj);
              }
            }
          });
          if (req.body.sort) {
            docs = docs.sort((a, b) => a.sort - b.sort);
          }

          res.json({
            done: true,
            list: docs,
            count: docs.length,
          });
        } else {
          app.all({ where, select, limit }, (err, docs) => {
            res.json({
              done: true,
              list: docs,
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
    site.categoriesList.forEach((doc) => {
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
