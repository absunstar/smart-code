module.exports = function init(site) {
  const $categories = site.connectCollection('categories');

  site.categoryList = [];
  site.handleCategory = function (cat) {
    cat.host = cat.host || '';
    return cat;
  };

  site.handleCategoryArticles = function () {
    site.categoryList.forEach((cat) => {
      site.$articles.findMany({ where: { 'category.id': cat.id }, sort: { id: -1 }, limit: 500 }, (err, docs) => {
        if (!err && docs) {
          docs.forEach((doc) => {
            if (site.articlesList.findIndex((a) => a.id == doc.id) == -1) {
              site.articlesList.push(site.handleArticle({ ...doc }));
            }
          });

          site.articlesList.sort((a, b) => {
            return b.id - a.id;
          });
        }
      });
    });
  };

  $categories.findMany({}, (err, docs) => {
    if (!err && docs) {
      docs.forEach((doc) => {
        site.categoryList.push(site.handleCategory(doc));
      });
      site.handleCategoryArticles();
    }
  });

  site.get(
    {
      name: 'categories',
    },
    (req, res) => {
      let setting = site.getSiteSetting(req.host);
      let language = setting.languageList.find((l) => l.id == req.session.lang) || setting.languageList[0];

      res.render(
        'categories/index.html',
        {
          setting: setting,
          language: language,
        },
        { parser: 'html' }
      );
    }
  );

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/categories/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let categoriesDoc = req.body;
    categoriesDoc.$req = req;
    categoriesDoc.$res = res;
    categoriesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let where = {};
    if (categoriesDoc.topParentId) {
      site.categoryList.forEach((a) => {
        if (a.id === categoriesDoc.parentId) {
          if (a.parentListId) {
            categoriesDoc.parentListId = [];
            for (let i = 0; i < a.parentListId.length; i++) {
              categoriesDoc.parentListId.push(a.parentListId[i]);
            }
            categoriesDoc.parentListId.push(categoriesDoc.parentId);
          } else {
            categoriesDoc.parentListId = [categoriesDoc.parentId];
          }
        }
      });
    }

    $categories.add(categoriesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.categoryList.push(site.handleCategory(doc));
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/categories/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let categoriesDoc = req.body;
    categoriesDoc.editUserInfo = req.getUserFinger();

    $categories.edit(
      {
        where: {
          id: categoriesDoc.id,
        },
        set: categoriesDoc,
        $req: req,
        $res: res,
      },
      (err, result) => {
        if (!err && result) {
          response.done = true;
          site.categoryList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.categoryList[i] = site.handleCategory(result.doc);
            }
          });
        } else {
          response.error = 'Code Already Exist';
        }
        res.json(response);
      }
    );
  });

  site.post('/api/categories/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.categoryList.forEach((a) => {
      if (a.id == req.body.id) {
        ad = a;
      }
    });

    if (ad) {
      response.done = true;
      response.doc = ad;
      res.json(response);
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post('/api/categories/delete', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let id = req.body.id;

    if (id) {
      $categories.findMany(
        {
          where: {
            parentId: id,
          },
        },
        (err, docs, count) => {
          if (count > 0) {
            response.error = 'Cant Delete Acc Err';
            res.json(response);
          } else {
            $categories.delete(
              {
                id: req.body.id,
                $req: req,
                $res: res,
              },
              (err, result) => {
                if (!err) {
                  response.done = true;
                  site.categoryList.splice(
                    site.categoryList.findIndex((a) => a.id === req.body.id),
                    1
                  );
                } else {
                  response.error = err.message;
                }
                res.json(response);
              }
            );
          }
        }
      );
    } else {
      response.error = 'no id';
      res.json(response);
    }
  });

  site.post({ name: '/api/categories/all', public: true }, (req, res) => {
    let response = {
      done: false,
    };
    let where = req.body.where || {};

    response.done = true;
    let filter = site.getHostFilter(req.host);
    response.list = site.categoryList.filter((doc) => {
      if (!doc.host.like(filter)) {
        return false;
      }

      let lang = doc.translatedList.find((t) => t.language.id == req.session.lang) || doc.translatedList[0];
      doc.name = lang.name;
      doc.$image = lang.image?.url;
      return true;
    });

    res.json(response);
  });

  site.getCategoryLookup = function (req) {
    let filter = site.getHostFilter(req.host);
    return site.categoryList
      .filter((doc) => {
        if (!doc.host.like(filter)) {
          return false;
        }
        let lang = doc.translatedList.find((t) => t.language.id == req.session.lang) || doc.translatedList[0];
        doc.name = lang.name;
        doc.$image = lang.image?.url;
        return true;
      })
      .map((c) => ({ id: c.id, name: c.name, image: c.$image }));
  };
  site.post({ name: '/api/categories/lookup', public: true }, (req, res) => {
    let response = {
      done: false,
    };

    response.done = true;
    response.list = site.getCategoryLookup(req);

    res.json(response);
  });
};
