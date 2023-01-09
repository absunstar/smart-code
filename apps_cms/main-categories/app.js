module.exports = function init(site) {
  const $mainCategories = site.connectCollection('mainCategories');

  site.mainCategoriesList = [];
  $mainCategories.findMany({}, (err, docs) => {
    if (!err && docs) {
      site.mainCategoriesList = [...site.mainCategoriesList, ...docs];
    }
  });

  site.get({
    name: 'mainCategories',
    path: __dirname + '/site_files/html/index.html',
    parser: 'html',
    compress: true,
  });

  site.get({
    name: 'images',
    path: __dirname + '/site_files/images/',
  });

  site.post('/api/mainCategories/add', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let mainCategoriesDoc = req.body;
    mainCategoriesDoc.$req = req;
    mainCategoriesDoc.$res = res;
    mainCategoriesDoc.addUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let where = {};
    if (mainCategoriesDoc.topParentId) {
      site.mainCategoriesList.forEach((a) => {
        if (a.id === mainCategoriesDoc.parentId) {
          if (a.parentListId) {
            mainCategoriesDoc.parentListId = [];
            for (let i = 0; i < a.parentListId.length; i++) {
              mainCategoriesDoc.parentListId.push(a.parentListId[i]);
            }
            mainCategoriesDoc.parentListId.push(mainCategoriesDoc.parentId);
          } else {
            mainCategoriesDoc.parentListId = [mainCategoriesDoc.parentId];
          }
        }
      });
    }

    $mainCategories.add(mainCategoriesDoc, (err, doc) => {
      if (!err) {
        response.done = true;
        response.doc = doc;
        site.mainCategoriesList.push(doc);
      } else {
        response.error = err.message;
      }
      res.json(response);
    });
  });

  site.post('/api/mainCategories/update', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let mainCategoriesDoc = req.body;

    mainCategoriesDoc.editUserInfo = site.security.getUserFinger({
      $req: req,
      $res: res,
    });

    let category = null;
    site.mainCategoriesList.forEach((c) => {
      if (c.parentId == mainCategoriesDoc.id) {
        category = c;
      }
    });
    if (category && mainCategoriesDoc.type == 'detailed') {
      response.error = 'Cant Change Detailed Err';
      res.json(response);
    } else {
      $mainCategories.edit(
        {
          where: {
            id: mainCategoriesDoc.id,
          },
          set: mainCategoriesDoc,
          $req: req,
          $res: res,
        },
        (err, result) => {
          if (!err && result) {
            response.done = true;
            site.mainCategoriesList.forEach((a, i) => {
              if (a.id === result.doc.id) {
                site.mainCategoriesList[i] = result.doc;
              }
            });
          } else {
            response.error = 'Code Already Exist';
          }
          res.json(response);
        }
      );
    }
  });

  site.post('/api/mainCategories/view', (req, res) => {
    let response = {
      done: false,
    };

    if (!req.session.user) {
      response.error = 'Please Login First';
      res.json(response);
      return;
    }

    let ad = null;
    site.mainCategoriesList.forEach((a) => {
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

  site.post('/api/mainCategories/delete', (req, res) => {
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
      $mainCategories.findMany(
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
            $mainCategories.delete(
              {
                id: req.body.id,
                $req: req,
                $res: res,
              },
              (err, result) => {
                if (!err) {
                  response.done = true;
                  site.mainCategoriesList.splice(
                    site.mainCategoriesList.findIndex((a) => a.id === req.body.id),
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

  site.post({ name: '/api/mainCategories/all', public: true }, (req, res) => {
    let response = {
      done: false,
    };

    if (req.data.lang) {
      // response.list = list[req.session.lang];
      response.list = [];
      response.topList = [];
      site.mainCategoriesList.forEach((doc) => {
        if ((doc2 = doc.translatedList.find((t) => t.language.id == req.session.lang))) {
          if (!doc.topParentId) {
            response.topList.push({
              id: doc.id,
              parentListId: doc.parentListId,
              topParentId: doc.topParentId,
              parentId: doc.parentId,
              status: doc.status,
              type: doc.type,
              name: doc2.name,
            });
          }
          response.list.push({
            id: doc.id,
            parentListId: doc.parentListId,
            topParentId: doc.topParentId,
            parentId: doc.parentId,
            status: doc.status,
            type: doc.type,
            name: doc2.name,
          });
        }

        // if(doc.language.id == 'ar'){
        //   list['ar'].push({...doc , ...doc2 , translatedList : null})
        // } else if(doc.language.id == 'en'){
        //   list['en'].push({...doc , ...doc2 , translatedList : null})
        // }
      });
      response.done = true;
      res.json(response);
    } else {
      let where = req.data.where || {};

      $mainCategories.findMany(
        {
          select: req.body.select || {},
          where: where,
          sort: req.body.sort || {},
          limit: req.body.limit,
        },
        (err, docs, count) => {
          if (!err) {
            response.done = true;
            response.list = docs;
            if (req.body.top) {
              response.topList = [];
              docs.forEach((_doc) => {
                if (!_doc.topParentId) {
                  response.topList.push(_doc);
                }
              });
            }

            response.count = count;
          } else {
            response.error = err.message;
          }
          res.json(response);
        }
      );
    }
  });
};
