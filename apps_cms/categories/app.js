module.exports = function init(site) {
  const $categories = site.connectCollection('categories');

  site.categoriesList = [];
  $categories.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.categoriesList = [...site.categoriesList, ...docs];
      site.handleCategoryArticles();
    }
  });

  site.get({
    name: 'categories',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

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
      site.categoriesList.forEach((a) => {
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
        site.categoriesList.push(doc);
        site.handleCategoryArticles();
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

    categoriesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let category = null;
    site.categoriesList.forEach((c) => {
      if (c.parentId == categoriesDoc.id) {
        category = c;
      }
    });

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
          site.categoriesList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.categoriesList[i] = result.doc;
              site.handleCategoryArticles();
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
    site.categoriesList.forEach((a) => {
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
                  site.categoriesList.splice(
                    site.categoriesList.findIndex((a) => a.id === req.body.id),
                    1
                  );
                  site.handleCategoryArticles();
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
    response.list = [];
    response.topList = [];
    site.categoriesList.forEach((doc) => {
      if ((doc2 = doc.translatedList.find((t) => t.language.id == req.session.lang)) && doc.active) {
        if (!where.active || doc.active) {
          if (!doc.topParentId) {
            response.topList.push({
              id: doc.id,
              parentListId: doc.parentListId,
              topParentId: doc.topParentId,
              parentId: doc.parentId,
              status: doc.status,
              name: doc2.name,
            });
          }
          response.list.push({
            id: doc.id,
            parentListId: doc.parentListId,
            topParentId: doc.topParentId,
            parentId: doc.parentId,
            status: doc.status,
            name: doc2.name,
          });
        }
      }

      // if(doc.language.id == 'ar'){
      //   list['ar'].push({...doc , ...doc2 , translatedList : null})
      // } else if(doc.language.id == 'en'){
      //   list['en'].push({...doc , ...doc2 , translatedList : null})
      // }
    });
    response.done = true;
    res.json(response);
  });
};
