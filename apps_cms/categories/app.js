module.exports = function init(site) {
  const $categories = site.connectCollection('categories');

  site.categoriesList = [];
  site.handleCategory = function (cat) {
    cat.host = cat.host || '_';
    return cat;
  };
  $categories.findMany({}, (err, docs) => {
    if (!err && docs) {
      docs.forEach((doc) => {
        site.categoriesList.push(site.handleCategory(doc));
      });
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
        site.categoriesList.push(site.handleCategory(doc));
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
          site.categoriesList.forEach((a, i) => {
            if (a.id === result.doc.id) {
              site.categoriesList[i] = site.handleCategory(result.doc);
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

    site.categoriesList.forEach((doc) => {
      let lang = doc.translatedList.find((t) => t.language.id == req.session.lang) || doc.translatedList[0];
      doc.name = lang.name;
      doc.$image = lang.image?.url;
    });
    response.list = site.categoriesList;
    res.json(response);
  });
};
